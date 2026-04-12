/**
 * In-memory store for the user-uploaded PDF context.
 * Supports one active context at a time; uploading a new file replaces the old one.
 */

let userContext = {
  filename: null,
  content: null,
  simplifiedSummary: null,
  uploadedAt: null,
};

/**
 * Save extracted text from user-uploaded PDF.
 * @param {string} filename
 * @param {string} content
 */
function setUserContext(filename, content) {
  userContext.filename = filename;
  userContext.content = content;
  userContext.uploadedAt = new Date().toISOString();
}

/**
 * Save simplified summary generated from user-uploaded PDF.
 * @param {string} summary
 */
function setSimplifiedContext(summary) {
  userContext.simplifiedSummary = summary;
}

/**
 * Get the current user-uploaded PDF context.
 * @returns {{ filename: string|null, content: string|null, simplifiedSummary: string|null, uploadedAt: string|null }}
 */
function getUserContext() {
  return userContext;
}

/**
 * Clear the stored user context.
 */
function clearUserContext() {
  userContext = { filename: null, content: null, simplifiedSummary: null, uploadedAt: null };
}

module.exports = { setUserContext, setSimplifiedContext, getUserContext, clearUserContext };
