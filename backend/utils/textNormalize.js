/**
 * Cleans raw text coming out of PDF/DOCX/OCR extraction (or pasted by the user)
 * without damaging document structure: paragraph breaks, numbers, dates and
 * currency values are preserved. Only leading/trailing junk and redundant
 * whitespace are removed.
 *
 * @param {string} text
 * @returns {string}
 */
function normalizeExtractedText(text) {
  if (!text || typeof text !== "string") return "";

  // Built from char codes (rather than literal source characters) so this
  // file stays plain ASCII and the invisible characters it targets can't
  // accidentally get lost/mangled by an editor or encoding pass.
  const NBSP = String.fromCharCode(0x00a0);
  const ZERO_WIDTH_CHARS = [0x200b, 0x200c, 0x200d, 0xfeff]
    .map((code) => String.fromCharCode(code))
    .join("");
  const INVISIBLE_RE = new RegExp("[" + ZERO_WIDTH_CHARS + "]", "g");

  return text
    // Normalize Windows/old-Mac line endings to \n
    .replace(/\r\n?/g, "\n")
    // Non-breaking space -> regular space
    .split(NBSP)
    .join(" ")
    // Zero-width spaces / BOM markers that PDF extractors sometimes leave behind
    .replace(INVISIBLE_RE, "")
    // Collapse repeated spaces/tabs (but never touch newlines here, so paragraphs survive)
    .replace(/[ \t]+/g, " ")
    // Drop trailing spaces at the end of a line
    .replace(/ +\n/g, "\n")
    // Collapse 3+ blank lines down to a single paragraph break
    .replace(/\n{3,}/g, "\n\n")
    // Remove leading blank lines/spaces/tabs entirely - this is the actual fix
    // for the "big empty gap before the first character" bug.
    .replace(/^\s+/, "")
    // Trim trailing whitespace
    .replace(/\s+$/, "");
}

module.exports = { normalizeExtractedText };
