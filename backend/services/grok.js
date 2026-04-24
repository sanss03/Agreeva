const axios = require('axios');

async function callGrok(systemPrompt, userMessage, expectJSON = false) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        response_format: expectJSON ? { type: "json_object" } : undefined
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let content = response.data.choices[0].message.content;

    if (expectJSON) {
      if (typeof content === 'string') {
        content = content.trim();
        // Remove '```json' or '```' at the beginning
        if (content.startsWith('```json')) {
          content = content.substring(7);
        } else if (content.startsWith('```')) {
          content = content.substring(3);
        }
        // Remove '```' at the end
        if (content.endsWith('```')) {
          content = content.substring(0, content.length - 3);
        }
        content = content.trim();
      }
    }

    return content;
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message;
    
    const message = typeof errorDetails === 'object' 
      ? JSON.stringify(errorDetails) 
      : errorDetails;
      
    console.error(`[Grok] API Error: ${message}`);
    throw new Error(`Grok API Error: ${message}`);
  }
}

module.exports = { callGrok };
