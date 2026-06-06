import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a', 'b', 'i', 'em', 'strong', 'u', 's', 'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div', 'figure', 'figcaption', 'del', 'sup', 'sub'
];

const ALLOWED_ATTR = [
  'href', 'title', 'alt', 'src', 'class', 'id',
  'colspan', 'rowspan', 'target', 'rel'
];

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer');
    node.setAttribute('target', '_blank');
  }
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src') || '';
    if (!/^(https?:|\/)/i.test(src)) {
      node.removeAttribute('src');
    }
  }
});

export function sanitizeHtml(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style']
  });
}

export function sanitizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^javascript:/i.test(trimmed)) return '';
  if (/^data:/i.test(trimmed) && !/^data:image\//i.test(trimmed)) return '';
  return trimmed;
}

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
