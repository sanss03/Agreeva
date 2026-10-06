const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_CANDIDATES = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
const DEFAULT_MODEL = MODEL_CANDIDATES[0];

/**
 * Safely retrieve and sanitize GROQ_API_KEY from environment variables
 */
function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || typeof key !== 'string') return '';
  return key.trim().replace(/^["']|["']$/g, '');
}

/**
 * Low-level, shared Groq client with automatic model fallback for 429 rate/token limits.
 * Both the document-analysis endpoint (/api/simplify) and chatbot endpoint (/api/chat) call through here.
 *
 * @param {{role: string, content: string}[]} messages
 * @param {{ temperature?: number, expectJSON?: boolean, model?: string, reasoningEffort?: string, maxTokens?: number }} [options]
 * @returns {Promise<string>}
 */
async function callGroqChat(messages, options = {}) {
  const { temperature = 0.3, expectJSON = false, reasoningEffort = 'low', maxTokens = 400 } = options;

  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('GROQ_CONFIG_MISSING: GROQ_API_KEY environment variable is not set');
    err.code = 'GROQ_CONFIG_MISSING';
    throw err;
  }

  // Determine which models to attempt
  const modelsToTry = options.model ? [options.model] : MODEL_CANDIDATES;
  let lastError;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const response = await axios.post(
        GROQ_URL,
        {
          model,
          messages,
          temperature,
          response_format: expectJSON ? { type: 'json_object' } : undefined,
          reasoning_effort: reasoningEffort,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      let content = response.data?.choices?.[0]?.message?.content;

      if (typeof content !== 'string' || !content.trim()) {
        console.error(`[Grok] Empty response from model ${model}:`, JSON.stringify(response.data));
        throw new Error('Grok API Error: Received an empty response from the AI service');
      }

      if (expectJSON) {
        content = content.trim();
        if (content.startsWith('```json')) {
          content = content.substring(7);
        } else if (content.startsWith('```')) {
          content = content.substring(3);
        }
        if (content.endsWith('```')) {
          content = content.substring(0, content.length - 3);
        }
        content = content.trim();
      }

      return content;
    } catch (error) {
      const status = error.response?.status;
      const errorDetails = error.response?.data?.error?.message
        || error.response?.data?.error
        || error.response?.data
        || error.message;

      const message = typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails)
        : String(errorDetails);

      lastError = error;
      const isRateOrTokenLimit = status === 429 || /limit|token|tpm|requested/i.test(message);

      console.warn(`[Grok] API Error on model '${model}'${status ? ` (${status})` : ''}: ${message}`);

      // If we hit a rate limit or token limit, retry with the next fallback model if available
      if (isRateOrTokenLimit && i < modelsToTry.length - 1) {
        console.log(`[Grok] Retrying request with fallback model '${modelsToTry[i + 1]}'...`);
        continue;
      }

      const err = new Error(`Grok API Error: ${message}`);
      err.status = status;
      throw err;
    }
  }

  const status = lastError?.response?.status;
  const message = lastError?.message || 'Failed all AI models';
  const err = new Error(`Grok API Error: ${message}`);
  err.status = status;
  throw err;
}

/**
 * Convenience wrapper for a single system + user message exchange
 * (kept for backward compatibility with the document-analysis endpoint).
 */
async function callGrok(systemPrompt, userMessage, expectJSON = false, maxTokens = 800) {
  return callGroqChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    { expectJSON, maxTokens }
  );
}

module.exports = { callGrok, callGroqChat, DEFAULT_MODEL };
