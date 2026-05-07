import { useEffect, useRef, useState } from 'react';
import { KitProduct } from '@/types/kits';
import { convertPlaceholderToPixels } from '@/lib/placeholderPixels';

interface KitItemPreviewProps {
  product?: KitProduct | null;
  logoUrl?: string;
  label?: string;
  className?: string;
}

const KitItemPreview = ({ product, logoUrl, label, className = '' }: KitItemPreviewProps) => {
  const primaryImage = product?.galleryImages?.find((image) => image.isPrimary)?.url || product?.galleryImages?.[0]?.url;
  const frontView = product?.design?.views?.find((view) => view.key === 'front') || product?.design?.views?.[0];
  const mockupUrl = frontView?.mockupImageUrl || primaryImage;
  const placeholder = frontView?.placeholders?.[0];
  const physicalWidth = product?.design?.physicalDimensions?.width || 1;
  const physicalHeight = product?.design?.physicalDimensions?.height || 1;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageNatural, setImageNatural] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const placeholderPx = (() => {
    if (!placeholder || !imageNatural || physicalWidth <= 0 || physicalHeight <= 0) return null;
    return convertPlaceholderToPixels(
      placeholder,
      imageNatural.w,
      imageNatural.h,
      { width: physicalWidth, height: physicalHeight }
    );
  })();

  const overlayStyle = (() => {
    if (!placeholderPx || !containerSize || !imageNatural) return null;

    // object-contain layout box for the rendered mockup within the square container.
    const scale = Math.min(containerSize.w / imageNatural.w, containerSize.h / imageNatural.h);
    const renderedW = imageNatural.w * scale;
    const renderedH = imageNatural.h * scale;
    const offsetX = (containerSize.w - renderedW) / 2;
    const offsetY = (containerSize.h - renderedH) / 2;

    return {
      left: `${offsetX + placeholderPx.x * scale}px`,
      top: `${offsetY + placeholderPx.y * scale}px`,
      width: `${Math.max(1, placeholderPx.width) * scale}px`,
      height: `${Math.max(1, placeholderPx.height) * scale}px`,
    } as const;
  })();

  const overlayRotation = placeholderPx?.rotation ? `rotate(${placeholderPx.rotation}deg)` : undefined;

  return (
    <div className={`overflow-hidden rounded-lg border bg-muted/30 ${className}`}>
      <div ref={containerRef} className="relative aspect-square w-full bg-white">
        {mockupUrl ? (
          <img
            src={mockupUrl}
            alt={product?.name || 'Kit item'}
            className="h-full w-full object-contain"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setImageNatural({ w: img.naturalWidth, h: img.naturalHeight });
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No preview
          </div>
        )}
        {logoUrl && overlayStyle && (
          <div className="absolute overflow-hidden rounded-md border border-white/70 bg-white/70 shadow" style={overlayStyle}>
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden"
              style={{ transform: overlayRotation, transformOrigin: 'center' }}
            >
              <img src={logoUrl} alt="Brand logo preview" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        )}
      </div>
      {(product?.name || label) && (
        <div className="border-t bg-background px-3 py-2 text-sm font-medium">
          {product?.name || label}
        </div>
      )}
    </div>
  );
};

export default KitItemPreview;
