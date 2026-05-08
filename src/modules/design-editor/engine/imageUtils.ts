/**
 * Image caching and tinting utilities.
 * Pure utilities — no React dependency.
 */

// Module-level image cache shared across all renders and mode switches
export const _imageCache = new Map<string, HTMLImageElement>();

export const getCachedImage = (url: string): Promise<HTMLImageElement> => {
  const cached = _imageCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  // Load via fetch → object URL so the resulting HTMLImageElement is always
  // same-origin from the browser's perspective. This prevents ctx.drawImage()
  // from tainting the canvas (which would silently break stage.toBlob()).
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const img = new window.Image();
      img.onload = () => {
        _imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load blob: ${url}`));
      img.src = blobUrl;
    } catch {
      // Network/CORS fetch failed — fall back to direct crossOrigin load
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        _imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      img.src = url;
    }
  });
};

// Module-level cache: key = `${imageUrl}|${hexColor}`
export const _tintCache = new Map<string, HTMLCanvasElement>();

/**
 * Apply a multiply-blend color tint to a garment image at the pixel level.
 * Only affects non-transparent pixels, so PNG mockups with transparent backgrounds
 * (the shirt silhouette) are tinted correctly while the background stays clear.
 * Falls back to the un-tinted canvas gracefully if CORS blocks pixel access.
 */
export function tintGarmentImage(img: HTMLImageElement, hexColor: string): HTMLCanvasElement {
  const cacheKey = `${img.src}|${hexColor}`;
  const cached = _tintCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) { _tintCache.set(cacheKey, canvas); return canvas; }

  ctx.drawImage(img, 0, 0);

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // No tint needed for white/near-white colours
  if (r > 240 && g > 240 && b > 240) {
    _tintCache.set(cacheKey, canvas);
    return canvas;
  }

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue; // skip fully-transparent pixels (background)
      // Multiply blend: result = (pixel * tintChannel) / 255
      d[i] = Math.round(d[i] * r / 255);
      d[i + 1] = Math.round(d[i + 1] * g / 255);
      d[i + 2] = Math.round(d[i + 2] * b / 255);
    }
    ctx.putImageData(imageData, 0, 0);
  } catch {
    // CORS policy blocked getImageData — draw un-tinted (silent fallback)
  }

  _tintCache.set(cacheKey, canvas);
  return canvas;
}
