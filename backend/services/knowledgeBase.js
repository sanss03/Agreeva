const fs = require('fs');
const path = require('path');
const pdfParseLib = require('pdf-parse');
// pdf-parse may export the function directly or as .default
const pdfParse = typeof pdfParseLib === 'function' ? pdfParseLib : pdfParseLib.default;

// In-memory knowledge base
let knowledgeBase = [];
let isLoaded = false;

/**
 * Load all PDFs from the /docs folder into memory.
 * Called once at server startup.
 */
async function loadAllPDFs() {
  const docsDir = path.join(__dirname, '..', 'docs');

  if (!fs.existsSync(docsDir)) {
    console.warn('[KnowledgeBase] docs/ folder not found. Skipping PDF load.');
    isLoaded = true;
    return;
  }

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'));

  if (files.length === 0) {
    console.log('[KnowledgeBase] No PDF files found in docs/. Skipping.');
    isLoaded = true;
    return;
  }

  console.log(`[KnowledgeBase] Loading ${files.length} PDF(s)...`);

  for (const filename of files) {
    try {
      const filePath = path.join(docsDir, filename);
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      const content = parsed.text.replace(/\s+/g, ' ').trim();

      knowledgeBase.push({ filename, content });
      console.log(`[KnowledgeBase] Loaded: ${filename} (${content.length} chars)`);
    } catch (err) {
      console.error(`[KnowledgeBase] Failed to parse ${filename}:`, err.message);
    }
  }

  isLoaded = true;
  console.log(`[KnowledgeBase] Done. ${knowledgeBase.length} document(s) ready.`);
}

/**
 * Returns all loaded document objects.
 * @returns {{ filename: string, content: string }[]}
 */
function getAllDocumentsText() {
  return knowledgeBase;
}

/**
 * Search for the most relevant snippet from knowledge base
 * matching the user's query using basic keyword scoring.
 * @param {string} query - User's question or message
 * @param {number} maxChars - Max characters of context to return
 * @returns {string} - Relevant context text or empty string
 */
function searchRelevantContext(query, maxChars = 1500) {
  if (!query || knowledgeBase.length === 0) return '';

  // Tokenize query into keywords (ignore short words)
  const keywords = query
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2);

  if (keywords.length === 0) return '';

  let bestScore = 0;
  let bestSnippet = '';

  for (const doc of knowledgeBase) {
    const lowerContent = doc.content.toLowerCase();
    const words = lowerContent.split(/\W+/);

    // Score = number of keyword matches in this document
    let score = 0;
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) score++;
    }

    if (score === 0) continue;

    // Find the best window of text around the first match
    const firstKeyword = keywords.find(k => lowerContent.includes(k));
    const matchIndex = firstKeyword ? lowerContent.indexOf(firstKeyword) : 0;

    // Extract a window of text around the best match
    const start = Math.max(0, matchIndex - 200);
    const end = Math.min(doc.content.length, start + maxChars);
    const snippet = `[${doc.filename}]: ...${doc.content.slice(start, end)}...`;

    if (score > bestScore) {
      bestScore = score;
      bestSnippet = snippet;
    }
  }

  return bestSnippet;
}

module.exports = {
  loadAllPDFs,
  getAllDocumentsText,
  searchRelevantContext,
};
