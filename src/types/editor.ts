import type { DisplacementSettings, NormalizedPosition } from '@/types/product';

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

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  zIndex: number;
  name?: string; // Human-readable name
  view?: string; // Store which view this element belongs to (e.g., 'front', 'back')
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontStyle?: string;
  align?: string;
  letterSpacing?: number;
  curved?: boolean;
  curveRadius?: number;
  curveShape?: 'arch-down' | 'arch-up' | 'circle';
  // Image specific
  imageUrl?: string;
  placeholderId?: string; // Store which placeholder this image belongs to
  // Shape specific
  shapeType?: 'rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'line' | 'arrow';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  // Advanced image properties
  flipX?: boolean;
  flipY?: boolean;
  scaleX?: number;
  scaleY?: number;
  lockAspectRatio?: boolean;
  skewX?: number; // Warping/distortion -180 to 180
  skewY?: number; // Warping/distortion -180 to 180
  // Original image pixel dimensions (for accurate DPI calculation)
  naturalWidth?: number;
  naturalHeight?: number;
  // Filters
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  hue?: number; // 0 to 360
  blur?: number; // 0 to 20
  // Shadow
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  // Border
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed';
  // Blend mode
  blendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity';
}

export interface HistoryState {
  elements: CanvasElement[];
  view: string; // Track which view this history state belongs to
  timestamp: number;
}

export interface Placeholder {
  id: string;
  name?: string;
  color?: string;
  xIn: number;
  yIn: number;
  widthIn: number;
  heightIn: number;
  rotationDeg?: number;
  scale?: number;
  lockSize?: boolean;
  dpi?: number;
  normalizedPosition?: NormalizedPosition;
  // For polygon/magnetic lasso placeholders
  polygonPoints?: Array<{ xIn: number; yIn: number }>;
  shapeType?: 'rect' | 'polygon';
}

export interface ProductView {
  key: string;
  mockupImageUrl: string;
  placeholders: Placeholder[];
}

export interface Product {
  _id?: string;
  id?: string;
  catalogue?: {
    name?: string;
    description?: string;
    basePrice?: number;
  };

  design?: {
    views?: ProductView[];
    dpi?: number;
    physicalDimensions?: {
      width?: number; // in inches
      height?: number; // in inches
      length?: number; // in inches
    };
    displacementSettings?: DisplacementSettings;
  };
  galleryImages?: Array<{ url: string; isPrimary?: boolean }>;
  availableColors?: string[];
  availableSizes?: string[];
}
