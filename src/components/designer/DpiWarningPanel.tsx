import { AlertTriangle } from 'lucide-react';

interface DpiWarningPanelProps {
  /** Map of elementId to effectiveDPI for all low-DPI images on the canvas */
  lowDpiImages: Record<string, number>;
}

const MIN_DPI = 300;

export function DpiWarningPanel({ lowDpiImages }: DpiWarningPanelProps) {
  const count = Object.keys(lowDpiImages).length;
  if (count === 0) return null;

  const lowestDpi = Math.min(...Object.values(lowDpiImages));

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 border border-destructive/40 rounded-lg shadow-lg p-3 w-80 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-sm text-destructive">Low Resolution Image</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {count === 1
              ? `Your image is only ${lowestDpi} DPI.`
              : `${count} images are below ${MIN_DPI} DPI (lowest: ${lowestDpi} DPI).`}
            {' '}Upload a higher resolution image to add this product to your store.
          </p>
          <p className="text-xs font-medium text-destructive mt-1">
            Required: {MIN_DPI}+ DPI · Current: {lowestDpi} DPI
          </p>
        </div>
      </div>
    </div>
  );
}
