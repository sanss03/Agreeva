require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const simplifyRoutes = require('./routes/simplify');
const chatRoutes = require('./routes/chat');
const consentRoutes = require('./routes/consent');
const ttsRoutes = require('./routes/tts');

const app = express();

// Configure CORS to allow all origins, headers, and methods
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));

// Configure JSON body parser
app.use(express.json());

// Mount routes
app.use('/api/simplify', simplifyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/tts', ttsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Listen on PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
