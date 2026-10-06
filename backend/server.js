const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Import routes
const simplifyRoutes = require('./routes/simplify');
const chatRoutes = require('./routes/chat');
const consentRoutes = require('./routes/consent');
const ttsRoutes = require('./routes/tts');
const uploadRoutes = require('./routes/upload');

// Import knowledge base loader
const { loadAllPDFs } = require('./services/knowledgeBase');

const app = express();

// Configure CORS.
// In production set FRONTEND_URL to the deployed frontend origin
// (e.g. https://agreeva.onrender.com). Falls back to '*' so local
// development keeps working without any extra configuration.
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  next();
});

// Configure JSON body parser. Raised from the 100kb default so a full
// extracted document (sent as documentText to /api/chat or /api/simplify/text)
// isn't rejected before it ever reaches a route handler.
app.use(express.json({ limit: '5mb' }));

// Mount routes
app.use('/api/simplify', simplifyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    groqConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim())
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request is too large. Please try a smaller document.' });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'The file is too large. Please upload a smaller file.' });
    }
    return res.status(400).json({ error: 'Could not process the uploaded file. Please try a different file.' });
  }
  // Validation-style errors (e.g. the file-type check in simplify.js) set err.status themselves.
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Unexpected server error' });
});

// Listen on PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  console.log(`GROQ_API_KEY is configured: ${Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim())}`);
  await loadAllPDFs();
});
