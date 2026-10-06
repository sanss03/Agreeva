const express = require('express');
const router = express.Router();
const {
  getHistory,
  addMessage,
  clearHistory,
  createSession,
} = require('../services/store');
const { searchRelevantContext } = require('../services/knowledgeBase');
const { getUserContext } = require('../services/userContext');
const { SYSTEM_PROMPT } = require('../services/systemPrompt');
const { callGroqChat } = require('../services/grok');

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

// Above this many characters, the full document is no longer inlined into
// the prompt - only the AI analysis + the passages most relevant to the
// question are sent, to keep requests fast, cheap and within model limits.
//
// Kept deliberately small: this account's Groq rate limit is a tight 8,000
// tokens/minute *shared across every call*, so a single oversized request
// (a large document + a long conversation history) was enough to exhaust it
// on its own and 429 every request for the rest of that minute.
const FULL_CONTEXT_CHAR_LIMIT = 3000;
const RELEVANT_CHUNK_BUDGET = 2000;
const MAX_HISTORY_MESSAGES = 4;
const MAX_HISTORY_MESSAGE_CHARS = 400;
const MAX_DOCUMENT_CHARS = 300000; // hard safety cap against pathological payloads

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
  const hasDevanagari = /[ऀ-ॿ]/.test(text);
  if (targetLang === "english") return !hasDevanagari;
  return hasDevanagari; // Simplified: assumes Hindi/Marathi use Devanagari
}

/**
 * Detect whether a message is a plain greeting (and nothing more).
 * Uses exact whole-word matching on a short message only, so real
 * questions that merely contain a greeting as a substring - e.g.
 * "What is **this** document about?" or "Can I cancel **thi**s agreement?" -
 * are never misclassified as greetings.
 */
function isGreeting(message) {
  const trimmed = message.trim().toLowerCase();
  const tokens = trimmed.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (tokens.length === 0 || tokens.length > 4) return false;
  return tokens.some((tok) => GREETINGS.includes(tok));
}

/** Turn the structured document analysis into a compact text block */
function formatAnalysisContext(analysis) {
  if (!analysis || typeof analysis !== 'object') return '';

  const lines = [];

  if (Array.isArray(analysis.simpleSummary) && analysis.simpleSummary.length) {
    lines.push('Key points:\n' + analysis.simpleSummary.map((p) => `- ${p}`).join('\n'));
  }
  if (Array.isArray(analysis.simplifiedPoints) && analysis.simplifiedPoints.length) {
    lines.push('Key points:\n' + analysis.simplifiedPoints.map((p) => `- ${p}`).join('\n'));
  }

  const fin = analysis.financialDetails && typeof analysis.financialDetails === 'object'
    ? analysis.financialDetails
    : analysis;
  // Round to whole rupees - the EMI/total/interest fields are computed via a
  // formula and often carry long floating-point tails (e.g. 11248.969112707866)
  // that would otherwise get echoed back verbatim in chat answers.
  const rupees = (n) => Math.round(n).toLocaleString('en-IN');
  const finLines = [];
  if (fin.principal) finLines.push(`Loan amount (principal): Rs. ${rupees(fin.principal)}`);
  if (fin.interestRate) finLines.push(`Interest rate: ${fin.interestRate}% per annum`);
  if (fin.tenure) finLines.push(`Tenure: ${fin.tenure} months`);
  if (fin.emi) finLines.push(`EMI: Rs. ${rupees(fin.emi)} per month`);
  if (fin.totalAmount) finLines.push(`Total payable: Rs. ${rupees(fin.totalAmount)}`);
  if (fin.interestAmount) finLines.push(`Total interest: Rs. ${rupees(fin.interestAmount)}`);
  if (finLines.length) lines.push('Financial details:\n' + finLines.join('\n'));

  if (analysis.riskLevel) lines.push(`Overall risk level: ${analysis.riskLevel}`);

  const risks = Array.isArray(analysis.risksAndWarnings) ? analysis.risksAndWarnings
    : Array.isArray(analysis.risks) ? analysis.risks
    : null;
  if (risks && risks.length) {
    lines.push('Risks and warnings:\n' + risks.map((r) => {
      if (typeof r === 'string') return `- ${r}`;
      return `- ${r.type ? r.type + ': ' : ''}${r.description || ''}${r.severity ? ` (${r.severity})` : ''}`;
    }).join('\n'));
  }

  return lines.join('\n\n');
}

/**
 * Pick the paragraphs of a large document that are most relevant to the
 * question (simple keyword-overlap scoring), staying within a char budget.
 * Keeps the opening paragraph too, since agreements usually name the
 * parties/loan there.
 */
function extractRelevantChunks(text, question, maxChars = RELEVANT_CHUNK_BUDGET) {
  if (!text) return '';

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return '';

  const keywords = (question || '')
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  const scored = paragraphs.map((p, idx) => {
    const lower = p.toLowerCase();
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
    return { idx, p, score };
  });

  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);

  const included = new Set();
  const picked = [];
  let used = 0;

  const tryAdd = (item) => {
    if (included.has(item.idx)) return;
    if (used + item.p.length > maxChars && picked.length > 0) return;
    included.add(item.idx);
    picked.push(item);
    used += item.p.length;
  };

  tryAdd({ idx: 0, p: paragraphs[0], score: 0 });
  for (const item of scored) {
    if (used >= maxChars) break;
    tryAdd(item);
  }

  picked.sort((a, b) => a.idx - b.idx);
  return picked.map((o) => o.p).join('\n\n');
}

/**
 * Decide how much of the document to hand to Groq: the full text for small
 * documents, or the AI analysis plus the passages relevant to the question
 * for large ones - never both in full, to keep requests small and fast.
 */
function buildDocumentContext({ documentText, analysis, question }) {
  const text = typeof documentText === 'string' ? documentText.slice(0, MAX_DOCUMENT_CHARS) : '';
  const analysisBlock = formatAnalysisContext(analysis);

  if (!text && !analysisBlock) return '';

  if (text && text.length <= FULL_CONTEXT_CHAR_LIMIT) {
    return [analysisBlock, `Full document text:\n${text}`].filter(Boolean).join('\n\n');
  }

  if (text) {
    const relevant = extractRelevantChunks(text, question);
    return [analysisBlock, relevant ? `Relevant excerpts from the document:\n${relevant}` : '']
      .filter(Boolean)
      .join('\n\n');
  }

  return analysisBlock;
}

/**
 * Resolve which context to attach to this question when the client didn't
 * send documentText/analysis directly (backward compatibility / fallback).
 * Priority 1 -> user-uploaded PDF
 * Priority 2 -> docs/ knowledge base (keyword match)
 */
function resolveContext(question) {
  const userCtx = getUserContext();

  if (userCtx.simplifiedSummary) {
    console.log('[Chat] Context source: simplified-summary');
    return userCtx.simplifiedSummary;
  }

  if (userCtx.content) {
    console.log(`[Chat] Context source: user-pdf:${userCtx.filename}`);
    return `User uploaded document (${userCtx.filename}):\n${userCtx.content.slice(0, 2000)}`;
  }

  const kbContext = searchRelevantContext(question);
  if (kbContext) {
    console.log('[Chat] Context source: knowledge-base');
    return `Knowledge base:\n${kbContext}`;
  }

  console.log('[Chat] Context source: none');
  return '';
}

// Maps the language string to a human-readable name for the prompt
const LANGUAGE_DISPLAY = {
  english: 'English',
  hindi: 'Hindi',
  marathi: 'Marathi',
};

/** Build the final system prompt string from base + document context + language */
function buildSystemPrompt({ documentContext, language }) {
  const langName = LANGUAGE_DISPLAY[language] || 'English';
  const isDevanagari = language === 'hindi' || language === 'marathi';

  const langBlock = [
    `MANDATORY LANGUAGE INSTRUCTION:`,
    `The user's selected application language is ${langName}.`,
    `You MUST respond EXCLUSIVELY in ${langName}.`,
    isDevanagari
      ? `Write your ENTIRE response in ${langName} using Devanagari script. Do NOT use English words or sentences in your answer.`
      : `Write your ENTIRE response in English.`,
    `Do NOT mix languages. Previous conversation history in English must NOT cause you to reply in English if the selected language is ${langName}.`,
    `Every explanation, answer, warning, follow-up suggestion, and conversational phrase must be in ${langName}.`,
    `Keep numbers, dates, currency values, percentages, and factual terms exactly as in the document.`,
  ].join('\n');

  const sections = [
    langBlock,
    documentContext ? `Document context:\n${documentContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return `${SYSTEM_PROMPT}\n\n---\n${sections}`;
}

/** Keep conversation history bounded so requests never grow unbounded */
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_MESSAGE_CHARS) }));
}

// Locale-keyed fallback suggestions when the AI response doesn't include SUGGESTIONS: markers
const FALLBACK_SUGGESTIONS = {
  english: ['Explain this document', 'What are the risks?'],
  hindi: ['मुझे यह दस्तावेज समझाएं', 'इसमें क्या जोखिम हैं?'],
  marathi: ['मला हा दस्तऐवज समजावून सांगा', 'यात कोणते धोके आहेत?'],
};

/** Call Groq and parse { answer, suggestions } out of the raw AI response */
async function callGroqWithSuggestions(messagesArray, language = 'english') {
  let answer = await callGroqChat(messagesArray);
  let suggestions = [];

  // Parse SUGGESTIONS: <s1> | <s2> marker
  if (/SUGGESTIONS:/i.test(answer)) {
    const parts = answer.split(/SUGGESTIONS:/i);
    const suggestionsLine = parts.pop().trim();
    suggestions = suggestionsLine
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
    answer = parts.join('SUGGESTIONS:').trim();
  }

  if (suggestions.length === 0) {
    suggestions = FALLBACK_SUGGESTIONS[language] || FALLBACK_SUGGESTIONS.english;
  }

  return { answer, suggestions };
}

/** Map a Groq/network error to an HTTP status + user-friendly message */
function respondWithChatError(res, error, routeLabel) {
  console.error(`[${routeLabel}] Error:`, error?.response?.data || error.message || error);

  if (error.code === 'GROQ_CONFIG_MISSING' || error.message?.includes('GROQ_CONFIG_MISSING')) {
    return res.status(503).json({ error: 'Chat service is not configured on the server. Please check GROQ_API_KEY in backend/.env.' });
  }
  if (error.status === 429) {
    return res.status(429).json({ error: 'Too many requests right now. Please wait a moment and try again.' });
  }
  if (error.status === 401 || error.status === 403 || error.message?.includes('Invalid API Key') || error.message?.includes('invalid_api_key')) {
    return res.status(502).json({ error: "AI service authentication failed. Please check GROQ_API_KEY in backend/.env." });
  }
  return res.status(500).json({ error: "Sorry, I couldn't answer that question right now. Please try again." });
}

// ---------------------------------------------------------------------------
// STATELESS ENDPOINT  ->  POST /api/chat
// Input:  { question, documentText, analysis, conversationHistory, language }
// Output: { answer, suggestions }
// ---------------------------------------------------------------------------

router.post('/', async (req, res) => {
  try {
    const { question, documentText, analysis, conversationHistory } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Missing required field: question' });
    }

    const detectedLang = req.body.language || detectLanguage(question);
    console.log(`[Chat] Language: ${detectedLang}`);

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

    let documentContext = buildDocumentContext({ documentText, analysis, question });
    if (!documentContext) {
      documentContext = req.body.context || resolveContext(question) || '';
    }

    const finalSystemPrompt = buildSystemPrompt({ documentContext, language: detectedLang });
    const history = sanitizeHistory(conversationHistory);

    const messagesArray = [
      { role: 'system', content: finalSystemPrompt },
      ...history,
      {
        role: 'user',
        content: `Respond ONLY in ${detectedLang}. STRICT: Do not use any other language.\n\nUSER QUESTION:\n${question}\n\n[After your answer, on a new line add exactly: SUGGESTIONS: <suggestion1 in ${detectedLang}> | <suggestion2 in ${detectedLang}>]`,
      },
    ];

    let result = await callGroqWithSuggestions(messagesArray, detectedLang);

    if (!isLanguageCorrect(result.answer, detectedLang)) {
      console.log(`[Chat] Language mismatch detected. Retrying with stricter instruction...`);
      messagesArray.push({ role: 'assistant', content: result.answer });
      messagesArray.push({
        role: 'user',
        content: `STRICT WARNING: Your previous answer was in the wrong language.\nYou MUST respond ONLY in ${detectedLang}. No exceptions. STRICT: Do not use any other language.`
      });
      result = await callGroqWithSuggestions(messagesArray, detectedLang);
    }

    return res.json({ answer: result.answer, suggestions: result.suggestions });

  } catch (error) {
    return respondWithChatError(res, error, 'POST /api/chat');
  }
});

// ---------------------------------------------------------------------------
// SESSION-BASED ENDPOINT  ->  POST /api/chat/session  &  /api/chat/message
// Kept for backward compatibility - supports server-side chat history per session
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

    const detectedLang = detectLanguage(message);
    console.log(`[Chat/Message] Detected Language: ${detectedLang}`);

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

    const documentContext = document_context || resolveContext(message) || '';
    const finalSystemPrompt = buildSystemPrompt({ documentContext, language: detectedLang });

    const messagesArray = [
      { role: 'system', content: finalSystemPrompt },
      ...sanitizeHistory(getHistory(session_id)),
      {
        role: 'user',
        content: `Respond ONLY in ${detectedLang}. STRICT: Do not use any other language.\n\nUSER QUESTION:\n${message}\n\n[After your answer, on a new line add exactly: SUGGESTIONS: <suggestion1> | <suggestion2>]`,
      },
    ];

    let result = await callGroqWithSuggestions(messagesArray, detectedLang);

    if (!isLanguageCorrect(result.answer, detectedLang)) {
      console.log(`[Chat/Message] Language mismatch detected. Retrying...`);
      messagesArray.push({ role: 'user', content: `STRICT WARNING: Your previous answer was in the wrong language.\nYou MUST respond ONLY in ${detectedLang}. No exceptions. STRICT: Do not use any other language.` });
      result = await callGroqWithSuggestions(messagesArray, detectedLang);
    }

    addMessage(session_id, 'user', message);
    addMessage(session_id, 'assistant', result.answer);

    return res.json({ reply: result.answer, suggestions: result.suggestions, session_id });

  } catch (error) {
    return respondWithChatError(res, error, 'POST /api/chat/message');
  }
});

router.delete('/session/:id', (req, res) => {
  const { id } = req.params;
  clearHistory(id);
  res.json({ cleared: true });
});

module.exports = router;
