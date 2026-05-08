/**
 * Text measurement and layout utilities.
 * Pure utilities — no React dependency.
 */

/** Canvas 2d word-wrap to mirror Konva Text with wrap="word" and a bounded width. */
export function wrapTextLinesForCanvasExport(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text.trim()) return [''];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
      continue;
    }
    if (line) {
      lines.push(line);
    }
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }
    let chunk = '';
    for (const ch of word) {
      const t = chunk + ch;
      if (ctx.measureText(t).width > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = t;
      }
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

/** Helper to measure text width using an offscreen canvas context. */
export const getTextWidth = (text: string, fontSize: number, fontFamily: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = `${fontSize}px ${fontFamily}`;
  return context.measureText(text).width;
};
