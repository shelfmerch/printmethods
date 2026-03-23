import { useEffect, useState } from 'react';
import { _imageCache, getCachedImage } from '@/utils/imageCache';

export const useImageLoader = (url: string | undefined) => {
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
