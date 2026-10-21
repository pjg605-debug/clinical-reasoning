(function (root) {
  'use strict';
  function resolve(note, text, options) {
    if (!note || typeof note.text !== 'string' || typeof text !== 'string') return null;
    const quote = note.text.trim();
    if (!quote) return null;
    const forceQuoteOnly = !!(options && options.forceQuoteOnly);
    if (!forceQuoteOnly && Number.isInteger(note.start) && Number.isInteger(note.end) &&
        note.start >= 0 && note.end > note.start && note.end <= text.length &&
        text.slice(note.start, note.end).trim() === quote) {
      return { start: note.start, end: note.end };
    }
    const start = text.indexOf(quote);
    if (start < 0 || text.indexOf(quote, start + 1) >= 0) return null;
    return { start: start, end: start + quote.length };
  }
  const api = { resolve: resolve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ChoiceProseAnchors = api;
})(typeof window !== 'undefined' ? window : null);
