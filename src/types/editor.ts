/**
 * Types for the Design Editor and DPI validation system.
 */

export type DpiQuality = 'excellent' | 'acceptable' | 'low';

/**
 * Represents a design element on the canvas with DPI metadata.
 * Used by DpiWarningPanel and related components.
 */
export interface DesignElement {
  id: string;
  type: 'image' | 'text' | 'shape' | 'group';
  effectiveDPI?: number;
  qualityStatus?: DpiQuality;
  isStretched?: boolean;
  printWidthInches?: number;
  printHeightInches?: number;
}

/**
 * The physical and pixel dimensions of a print placeholder.
 */
export interface PlaceholderConfig {
  /** Width of the placeholder in pixels on the canvas */
  widthPx: number;
  /** Height of the placeholder in pixels on the canvas */
  heightPx: number;
  /** Physical width of the print area in inches */
  widthInches: number;
  /** Physical height of the print area in inches */
  heightInches: number;
}

/**
 * Result of a DPI calculation for an image element.
 */
export interface DpiResult {
  /** DPI along the horizontal axis */
  dpiX: number;
  /** DPI along the vertical axis */
  dpiY: number;
  /** Effective (safe minimum) DPI: min(dpiX, dpiY) */
  effectiveDPI: number;
  /** Quality classification based on effectiveDPI */
  qualityStatus: DpiQuality;
  /** True if the image is being stretched (aspect ratio distortion > 5%) */
  isStretched: boolean;
  /** Physical width of the image at current size, in inches */
  physicalWidthInches: number;
  /** Physical height of the image at current size, in inches */
  physicalHeightInches: number;
  /** Physical width in cm */
  physicalWidthCm: number;
  /** Physical height in cm */
  physicalHeightCm: number;
}

/**
 * Classifies a DPI value into a quality tier.
 */
export function classifyDpi(dpi: number): DpiQuality {
  if (dpi >= 300) return 'excellent';
  if (dpi >= 250) return 'acceptable';
  return 'low';
}

/**
 * Calculates the effective print DPI for an image element.
 * @param imageNaturalWidth - Pixel width of the original image file
 * @param elementWidthPx - Width of the element on the canvas in pixels
 * @param pxPerInch - The canvas pixel-per-inch ratio
 */
export function calculateEffectiveDpi(
  imageNaturalWidth: number,
  elementWidthPx: number,
  pxPerInch: number,
): number {
  if (pxPerInch <= 0 || elementWidthPx <= 0) return 0;
  const printWidthInches = elementWidthPx / pxPerInch;
  return Math.round(imageNaturalWidth / printWidthInches);
}
