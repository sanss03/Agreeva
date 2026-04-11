const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParseLib = require('pdf-parse');
const pdfParse = typeof pdfParseLib === 'function' ? pdfParseLib : pdfParseLib.default;
const { setUserContext, getUserContext, clearUserContext } = require('../services/userContext');

// Use memory storage – no files saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const isPDF = file.mimetype.includes('pdf') || file.originalname.toLowerCase().endsWith('.pdf');
    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted.'));
    }
  },
});

/**
 * POST /api/upload
 * Accepts a PDF, extracts its text, stores it as userContext.
 */
router.post('/', upload.single('file'), async (req, res) => {
  console.log(`[Upload] Incoming request: ${req.file ? req.file.originalname : 'No file'}`);
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided. Use field name "file".' });
    }

    const buffer = Buffer.from(req.file.buffer);
    const data = await pdfParse(buffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.trim() === '') {
      return res.status(422).json({ error: 'PDF has no readable text' });
    }

    const cleanText = extractedText.replace(/\s+/g, ' ').trim();

    // Replace any previous context with the new one
    setUserContext(req.file.originalname, cleanText);

    console.log("File received:", req.file.originalname);
    console.log("Extracted length:", cleanText.length);

    res.json({
      success: true,
      filename: req.file.originalname,
      charCount: cleanText.length,
      preview: cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : ''),
      extractedText: cleanText,
      text: cleanText, // Alias for easier frontend use
    });
  } catch (err) {
    console.error('[Upload] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process uploaded PDF.' });
  }
});

/**
 * GET /api/upload/context
 * Returns the currently stored user context (for debugging / status checks).
 */
router.get('/context', (req, res) => {
  const ctx = getUserContext();
  if (!ctx.filename) {
    return res.json({ active: false, message: 'No user PDF uploaded yet.' });
  }
  res.json({
    active: true,
    filename: ctx.filename,
    uploadedAt: ctx.uploadedAt,
    charCount: ctx.content?.length || 0,
    preview: ctx.content?.slice(0, 300) + '...',
  });
});

/**
 * DELETE /api/upload/context
 * Clears the stored user context.
 */
router.delete('/context', (req, res) => {
  clearUserContext();
  res.json({ success: true, message: 'User context cleared.' });
});

module.exports = router;
