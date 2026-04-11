const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { callGrok } = require('../services/grok');

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const systemPrompt = `You are a financial document analyzer for Indian users with low literacy. Analyze the given financial agreement and return ONLY a valid JSON object with NO markdown, no explanation, no preamble. The JSON must have exactly these fields:
  {
    "simplifiedPoints": array of 5-7 strings in very simple Hindi-English (Hinglish friendly) language explaining what the person is agreeing to. Each point must be one clear sentence starting with 'You will...' or 'If you...' or 'The bank will...',
    "principal": number (loan amount in rupees, or 0 if not found),
    "interestRate": number (annual interest rate percentage, or 0 if not found),
    "tenure": number (loan duration in months, or 0 if not found),
    "riskLevel": one of "low", "medium", "high" based on overall risk,
    "risks": array of objects each with: type (short name), description (simple 1 sentence explanation), severity ("warning" or "danger")
  }
  Calculate: emi using formula P*r*(1+r)^n/((1+r)^n-1) where r=interestRate/12/100, n=tenure
  Calculate: totalAmount = emi * tenure
  Calculate: interestAmount = totalAmount - principal
  If you cannot find financial figures in the document, make reasonable estimates and flag them as risks.`;

async function handleSimplifyRequest(req, res) {
  try {
    let text = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } else {
        text = req.file.buffer.toString('utf8');
      }
    } else if (req.body && req.body.text) {
      text = req.body.text;
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: "No text provided" });
    }

    const grokResponse = await callGrok(systemPrompt, text, true);
    
    let parsedData;
    try {
      parsedData = JSON.parse(grokResponse);
    } catch (e) {
      console.error("Grok JSON parsing error:", e, grokResponse);
      return res.status(500).json({ error: "Failed to analyze document" });
    }

    parsedData.originalText = text;

    let p = parseFloat(parsedData.principal) || 0;
    let r = parseFloat(parsedData.interestRate) || 0;
    let n = parseFloat(parsedData.tenure) || 0;

    let emi = parseFloat(parsedData.emi) || 0;
    let totalAmount = parseFloat(parsedData.totalAmount) || 0;
    let interestAmount = parseFloat(parsedData.interestAmount) || 0;

    if (p > 0 && r > 0 && n > 0 && (!emi || emi === 0)) {
      const monthlyRate = r / 12 / 100;
      const num = p * monthlyRate * Math.pow(1 + monthlyRate, n);
      const den = Math.pow(1 + monthlyRate, n) - 1;
      emi = num / den;
      totalAmount = emi * n;
      interestAmount = totalAmount - p;
    }

    parsedData.emi = emi;
    parsedData.totalAmount = totalAmount;
    parsedData.interestAmount = interestAmount;

    return res.json(parsedData);

  } catch (error) {
    console.error("Simplify handler error:", error);
    return res.status(500).json({ error: "Failed to analyze document" });
  }
}

router.post('/', upload.single('file'), handleSimplifyRequest);
router.post('/text', express.json(), handleSimplifyRequest);

module.exports = router;
