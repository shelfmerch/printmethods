const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

const ALLOWED_ATTRS = new Set(['href', 'target', 'rel', 'colspan', 'rowspan']);

const isSafeUrl = (value: string) => {
  try {
    const parsed = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export function sanitizeHtml(html: string) {
  if (!html || typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';

  const parser = new DOMParser();
  const document = parser.parseFromString(`<template>${html}</template>`, 'text/html');
  const template = document.querySelector('template');
  const root = template?.content || document.body;

  const sanitizeNode = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';

      if (name.startsWith('on') || name === 'style' || !ALLOWED_ATTRS.has(name)) {
        element.removeAttribute(attr.name);
        continue;
      }

      if (name === 'href' && !isSafeUrl(value)) {
        element.removeAttribute(attr.name);
      }
    }

    if (tag === 'a') {
      element.setAttribute('rel', 'noopener noreferrer');
      if (element.getAttribute('target') === '_blank') {
        element.setAttribute('target', '_blank');
      }
    }
  };

  let node = root.firstChild;
  while (node) {
    const next = node.nextSibling;
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (const child of Array.from(node.childNodes)) sanitizeNode(child);
      sanitizeNode(node);
    }
    node = next;
  }

  for (const element of Array.from(root.querySelectorAll('*'))) {
    sanitizeNode(element);
  }

  const container = document.createElement('div');
  container.append(...Array.from(root.childNodes));
  return container.innerHTML;
}
