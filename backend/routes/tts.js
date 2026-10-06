const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const googleTTS = require('google-tts-api');
const router = express.Router();

// Language mapping
const langMap = {
  'en': 'en',
  'hi': 'hi',
  'mr': 'mr',  // Marathi
};

router.get('/test', (req, res) => {
  res.json({ 
    message: 'TTS endpoint is working',
    supportedLanguages: langMap,
  });
});

router.post('/', async (req, res) => {
  try {
    const { text, lang = 'en' } = req.body;

    console.log(`[TTS] Request - Language: ${lang}, Text length: ${text?.length || 0}, Text type: ${typeof text}`);
    console.log(`[TTS] Raw text:`, text);

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text must be a string' });
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    const fileName = `tts-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.mp3`;
    // Use os.tmpdir() so temp files land in /tmp on Render/Linux instead of
    // the app directory, which may be read-only in production.
    const filePath = path.join(os.tmpdir(), fileName);
    
    const gttsLang = langMap[lang] || 'en';
    console.log(`[TTS] Using language: ${gttsLang} (mapped from ${lang})`);
    
    try {
      const textToSpeak = text.trim().substring(0, 1000);
      console.log(`[TTS] Text to speak (${textToSpeak.length} chars):`, textToSpeak.substring(0, 100));
      
      const urls = await googleTTS.getAllAudioUrls({
        text: textToSpeak,
        lang: gttsLang
      });
      
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new Error('No audio URLs generated');
      }
      
      console.log(`[TTS] Generated ${urls.length} audio URL(s)`);
      
      // Download and combine audio files
      const https = require('https');
      let totalSize = 0;
      let filesDownloaded = 0;
      
      for (const url of urls) {
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream(filePath, { flags: filesDownloaded > 0 ? 'a' : 'w' });
          https.get(url, (response) => {
            response.pipe(file);
            response.on('data', (chunk) => {
              totalSize += chunk.length;
            });
            file.on('finish', () => {
              file.close();
              filesDownloaded++;
              console.log(`[TTS] Downloaded chunk ${filesDownloaded}/${urls.length}`);
              resolve();
            });
          }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });
        });
      }
      
      console.log(`[TTS] File generated: ${fileName} (${totalSize} bytes)`);
      
      res.type('audio/mpeg');
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('[TTS] Send file error:', err.message);
        } else {
          console.log(`[TTS] File sent successfully: ${fileName}`);
        }
        
        // Clean up temp file after sending
        setTimeout(() => {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('[TTS] Failed to delete temp file:', unlinkErr.message);
            } else {
              console.log(`[TTS] Temp file deleted: ${fileName}`);
            }
          });
        }, 500);
      });
    } catch (innerErr) {
      console.error('[TTS] Inner error:', innerErr.message, innerErr.stack);
      // Clean up on error
      fs.unlink(filePath, () => {});
      res.status(500).json({ 
        error: 'Failed to generate speech',
        details: innerErr.message 
      });
    }
  } catch (err) {
    console.error('[TTS] Outer error:', err.message);
    res.status(500).json({
      error: 'Failed to generate speech',
      details: err.message
    });
  }
});

module.exports = router;


