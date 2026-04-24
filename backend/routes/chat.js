const express = require('express');
const router = express.Router();
const axios = require('axios');
const {
  getHistory,
  addMessage,
  clearHistory,
  createSession,
} = require('../services/store');
const { searchRelevantContext } = require('../services/knowledgeBase');
const { getUserContext } = require('../services/userContext');
const { SYSTEM_PROMPT } = require('../services/systemPrompt');

// ---------------------------------------------------------------------------
// SHARED HELPERS
// ---------------------------------------------------------------------------

const GREETINGS = ['hi', 'hey', 'hello', 'hii', 'helo', 'namaste', 'नमस्ते', 'नमस्कार'];

/** Detect language using keywords */
function detectLanguage(text) {
  if (text.includes("क्या") || text.includes("है")) return "hindi";
  if (text.includes("आहे") || text.includes("मला")) return "marathi";
  return "english";
}

/** Check if response matches target language script */
function isLanguageCorrect(text, targetLang) {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (targetLang === "english") return !hasDevanagari;
  return hasDevanagari; // Simplified: assumes Hindi/Marathi use Devanagari
}

/** Detect whether a message is a plain greeting */
function isGreeting(message) {
  return GREETINGS.some(g => message.trim().toLowerCase().includes(g));
}

/**
 * Resolve which context to attach to this question.
 * Priority 1 → user-uploaded PDF
 * Priority 2 → docs/ knowledge base (keyword match)
 */
function resolveContext(question) {
  const userCtx = getUserContext();
  
  // Priority 1: AI Simplified Summary
  if (userCtx.simplifiedSummary) {
    console.log('[Chat] Context source: simplified-summary');
    return userCtx.simplifiedSummary;
  }
  
  // Priority 2: User-uploaded original PDF text
  if (userCtx.content) {
    console.log(`[Chat] Context source: user-pdf:${userCtx.filename}`);
    return `User uploaded document (${userCtx.filename}):\n${userCtx.content.slice(0, 2000)}`;
  }
  
  // Priority 3: docs/ knowledge base (general keyword match)
  const kbContext = searchRelevantContext(question);
  if (kbContext) {
    console.log('[Chat] Context source: knowledge-base');
    return `Knowledge base:\n${kbContext}`;
  }
  
  console.log('[Chat] Context source: none');
  return '';
}

/** Build the final system prompt string from base + dynamic sections */
function buildSystemPrompt({ context, documentContext, language }) {
  const sections = [
    documentContext ? `Context: ${documentContext}` : '',
    context || '',
    language ? `Detected Language:\n${language}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return sections ? `${SYSTEM_PROMPT}\n\n---\n${sections}` : SYSTEM_PROMPT;
}

/** Call Groq and parse { answer, suggestions } out of the raw AI response */
async function callGroqWithSuggestions(messagesArray) {
  let { answer, suggestions } = await callGroqAPI(messagesArray);

  // Parse SUGGESTIONS: <s1> | <s2> marker
  if (/SUGGESTIONS:/i.test(answer)) {
    const parts = answer.split(/SUGGESTIONS:/i);
    const suggestionsLine = parts.pop().trim();
    suggestions = suggestionsLine
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
    answer = parts[0].trim();
  }

  // Fallback suggestions
  if (suggestions.length === 0) {
    suggestions = [
      'Explain this document',
      'What are the risks?',
    ];
  }

  return { answer, suggestions };
}

/** Internal wrapper for Groq API */
async function callGroqAPI(messagesArray) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: messagesArray,
      temperature: 0.3, // Lower temperature for stricter consistency
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return { answer: response.data.choices[0].message.content };
}

// ---------------------------------------------------------------------------
// STATELESS ENDPOINT  →  POST /api/chat
// Input:  { question, language }
// Output: { answer, suggestions }
// ---------------------------------------------------------------------------

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing required field: question' });
    }

    // Step 1: Language Detection
    const detectedLang = req.body.language || detectLanguage(question);
    console.log(`[Chat] Language: ${detectedLang}`);

    // Step 2: Greeting check
    if (isGreeting(question)) {
      const greetingMap = {
        hindi: 'नमस्ते! 👋 मैं आपकी वित्तीय दस्तावेज़ों को समझने में कैसे मदद कर सकता हूँ?',
        marathi: 'नमस्ते! 👋 मी तुम्हाला तुमची वित्तीय कागदपत्रे समजून घेण्यास कशी मदत करू शकतो?',
        english: 'Hello! 👋 How can I help you understand your financial document today?'
      };
      const answer = greetingMap[detectedLang];
      return res.json({
        answer,
        suggestions: detectedLang === 'hindi' ? ['मुझे यह दस्तावेज समझाएं', 'इसमें क्या जोखिम हैं?'] : 
                    detectedLang === 'marathi' ? ['मला हा दस्तऐवज समजावून सांगा', 'यात कोणते धोके आहेत?'] :
                    ['Explain this document', 'What are the risks?'],
      });
    }

    const summaryText = req.body.context || resolveContext(question) || 'No summary available.';
    const finalSystemPrompt = `${SYSTEM_PROMPT}\n\nSummary:\n${summaryText}`;

    const messagesArray = [
      { role: 'system', content: finalSystemPrompt },
      {
        role: 'user',
        content: `Respond ONLY in ${detectedLang}. STRICT: Do not use any other language.\n\nUSER QUESTION:\n${question}\n\n[After your answer, on a new line add exactly: SUGGESTIONS: <suggestion1> | <suggestion2>]`,
      },
    ];

    // Step 5: Send to Groq with Fallback Retry
    let result = await callGroqWithSuggestions(messagesArray);

    // Step 6: Safety Fallback - Retry if language mismatch
    if (!isLanguageCorrect(result.answer, detectedLang)) {
      console.log(`[Chat] Language mismatch detected. Retrying with stricter instruction...`);
      messagesArray.push({ role: 'assistant', content: result.answer });
      messagesArray.push({ 
        role: 'user', 
        content: `STRICT WARNING: Your previous answer was in the wrong language.\nYou MUST respond ONLY in ${detectedLang}. No exceptions. STRICT: Do not use any other language.` 
      });
      result = await callGroqWithSuggestions(messagesArray);
    }

    return res.json({ answer: result.answer, suggestions: result.suggestions });

  } catch (error) {
    console.error('[POST /api/chat] Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// ---------------------------------------------------------------------------
// SESSION-BASED ENDPOINT  →  POST /api/chat/session  &  /api/chat/message
// Kept for backward compatibility – supports chat history per session
// ---------------------------------------------------------------------------

router.post('/session', (req, res) => {
  const session_id = createSession();
  res.json({ session_id });
});

router.post('/message', async (req, res) => {
  try {
    const { session_id, message, document_context } = req.body;

    if (!session_id || !message) {
      return res.status(400).json({ error: 'Missing session_id or message' });
    }

    // Step 1: Language Detection
    const detectedLang = detectLanguage(message);
    console.log(`[Chat/Message] Detected Language: ${detectedLang}`);

    // Step 2: Greeting check
    if (isGreeting(message)) {
      const greetingMap = {
        hindi: 'नमस्ते! 👋 मैं आपकी वित्तीय दस्तावेज़ों को समझने में कैसे मदद कर सकता हूँ?',
        marathi: 'नमस्ते! 👋 मी तुम्हाला तुमची वित्तीय कागदपत्रे समजून घेण्यास कशी मदत करू शकतो?',
        english: 'Hello! 👋 How can I help you understand your financial document today?'
      };
      const answer = greetingMap[detectedLang];
      addMessage(session_id, 'user', message);
      addMessage(session_id, 'assistant', answer);
      return res.json({ reply: answer, suggestions: ['Explain this agreement', 'What are risks?'], session_id });
    }

    const summaryText = document_context || resolveContext(message) || 'No summary available.';
    const finalSystemPrompt = `${SYSTEM_PROMPT}\n\nSummary:\n${summaryText}`;

    const messagesArray = [
      { role: 'system', content: finalSystemPrompt },
      ...getHistory(session_id),
      {
        role: 'user',
        content: `Respond ONLY in ${detectedLang}. STRICT: Do not use any other language.\n\nUSER QUESTION:\n${message}\n\n[After your answer, on a new line add exactly: SUGGESTIONS: <suggestion1> | <suggestion2>]`,
      },
    ];

    let result = await callGroqWithSuggestions(messagesArray);

    // Step 6: Safety Fallback
    if (!isLanguageCorrect(result.answer, detectedLang)) {
      console.log(`[Chat/Message] Language mismatch detected. Retrying...`);
      messagesArray.push({ role: 'user', content: `STRICT WARNING: Your previous answer was in the wrong language.\nYou MUST respond ONLY in ${detectedLang}. No exceptions. STRICT: Do not use any other language.` });
      result = await callGroqWithSuggestions(messagesArray);
    }

    addMessage(session_id, 'user', message);
    addMessage(session_id, 'assistant', result.answer);

    return res.json({ reply: result.answer, suggestions: result.suggestions, session_id });

  } catch (error) {
    console.error('[POST /api/chat/message] Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

router.delete('/session/:id', (req, res) => {
  const { id } = req.params;
  clearHistory(id);
  res.json({ cleared: true });
});

module.exports = router;
