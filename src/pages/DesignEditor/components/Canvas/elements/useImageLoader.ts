import { useState, useEffect } from 'react';
import { getCachedImage, _imageCache } from '../../../engine/imageUtils';

/**
 * Custom hook for loading images using the shared module-level cache.
 * Returns null while loading or on error, and the HTMLImageElement when ready.
 */
export const useImageLoader = (url: string | undefined): HTMLImageElement | null => {
  const [image, setImage] = useState<HTMLImageElement | null>(() => {
    if (!url) return null;
    const cached = _imageCache.get(url);
    return cached && cached.complete && cached.naturalWidth > 0 ? cached : null;
  });

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }

    let cancelled = false;

    getCachedImage(url)
      .then((img) => {
        if (!cancelled) {
          setImage(img);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImage(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return image;
};
