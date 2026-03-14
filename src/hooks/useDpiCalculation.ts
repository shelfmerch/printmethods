import { useCallback } from 'react';
import type { DpiResult, DpiQuality, PlaceholderConfig } from '../types/editor';

function classifyDpi(dpi: number): DpiQuality {
  if (dpi >= 250) return 'excellent';
  if (dpi >= 100) return 'acceptable';
  return 'low';
}

export function useDpiCalculation() {
  const calculateDpi = useCallback(
    (
      imagePixelWidth: number,
      imagePixelHeight: number,
      imageDisplayWidth: number,
      imageDisplayHeight: number,
      placeholder: PlaceholderConfig
    ): DpiResult => {
      // Use absolute values to handle flipped images
      const absDisplayW = Math.abs(imageDisplayWidth);
      const absDisplayH = Math.abs(imageDisplayHeight);

      // Design density (Design pixels per inch)
      const designPpiX = placeholder.widthPx / placeholder.widthInches;
      const designPpiY = placeholder.heightPx / placeholder.heightInches;

      // Physical size of the image on the final product
      const physicalWidthInches = absDisplayW / designPpiX;
      const physicalHeightInches = absDisplayH / designPpiY;

      // DPI for each axis
      const dpiX = physicalWidthInches > 0 ? imagePixelWidth / physicalWidthInches : 0;
      const dpiY = physicalHeightInches > 0 ? imagePixelHeight / physicalHeightInches : 0;

      // Effective DPI is generally the lower of the two (safe for print)
      const effectiveDPI = Math.floor(Math.min(dpiX, dpiY));

      // Detected stretching if X and Y DPI differ by more than 5%
      const isStretched = Math.abs(dpiX - dpiY) / Math.max(dpiX, dpiY) > 0.05;

      const physicalWidthCm = physicalWidthInches * 2.54;
      const physicalHeightCm = physicalHeightInches * 2.54;

      const qualityStatus = classifyDpi(effectiveDPI);

      return {
        dpiX,
        dpiY,
        effectiveDPI,
        qualityStatus,
        isStretched,
        physicalWidthInches: Number(physicalWidthInches.toFixed(2)),
        physicalHeightInches: Number(physicalHeightInches.toFixed(2)),
        physicalWidthCm: Number(physicalWidthCm.toFixed(2)),
        physicalHeightCm: Number(physicalHeightCm.toFixed(2))
      };
    },
    []
  );

  return { calculateDpi };
}
