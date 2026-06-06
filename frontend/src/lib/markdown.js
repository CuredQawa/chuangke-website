import { marked } from 'marked';
import { sanitizeHtml, sanitizeUrl, escapeHtml } from './sanitize.js';

export { sanitizeHtml, sanitizeUrl, escapeHtml };

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false
});

export function renderMarkdown(md) {
  if (!md) return '';
  const raw = marked.parse(md);
  return sanitizeHtml(raw);
}

export function renderPlainNewlines(text) {
  if (!text) return '';
  return sanitizeHtml(text);
}
