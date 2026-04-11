const express = require('express');
const router = express.Router();
const axios = require('axios');
const { 
  getHistory, 
  addMessage, 
  clearHistory, 
  createSession 
} = require('../services/store');

router.post('/session', (req, res) => {
  const session_id = createSession();
  res.json({ session_id });
});

router.post('/message', async (req, res) => {
  try {
    const { session_id, message, document_context, language } = req.body;
    
    if (!session_id || !message) {
      return res.status(400).json({ error: "Missing session_id or message" });
    }

    const history = getHistory(session_id);
    const systemPrompt = `You are SamarthaSign AI, a friendly financial assistant helping Indian users understand financial agreements. Keep answers very short (2-3 sentences max). Use very simple language, no legal jargon. If user writes in Hindi or Marathi, reply in the same language. Document context: ${document_context || ''}`;

    const messagesArray = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      { 
        model: "llama-3.3-70b-versatile", 
        messages: messagesArray, 
        temperature: 0.5 
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    // Add exactly what was requested to the store: user message, then assistant reply
    addMessage(session_id, 'user', message);
    addMessage(session_id, 'assistant', reply);

    res.json({ reply, session_id });
  } catch (error) {
    console.error("Chat handler error:", error?.response?.data || error);
    res.status(500).json({ error: "Chat failed" });
  }
});

router.delete('/session/:id', (req, res) => {
  const { id } = req.params;
  clearHistory(id);
  res.json({ cleared: true });
});

module.exports = router;
