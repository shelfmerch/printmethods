import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface ProductView {
  key: string;
  mockupImageUrl: string;
  placeholders: Placeholder[];
}

interface Placeholder {
  id?: string;
  widthIn?: number;
  heightIn?: number;
  xIn?: number;
  yIn?: number;
  rotationDeg?: number;
  scale?: number;
  dpi?: number;
}

interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  colorHex?: string;
  sku?: string;
  price?: number;
  isActive?: boolean;
}

// Store multiple sizes per color as Record<colorName, Set<size>>
// But pass/receive as Record<colorName, string[]> for serialization

interface PrintMethodOption {
  _id: string;
  name: string;
  code: string;
  moq: number;
  baseRatePaisePerSqIn: number;
  hasColors: boolean;
  colorRatePaise: number;
  minColors: number;
  active: boolean;
  description?: string;
}

interface Product {
  _id?: string;
  id?: string;
  basePrice?: number;
  catalogue?: {
    name?: string;
    description?: string;
    basePrice?: number;
  };
  design?: {
    views?: ProductView[];
    dpi?: number;
    physicalDimensions?: {
      width?: number;
      height?: number;
      length?: number;
    };
  };
  galleryImages?: Array<{ url: string; isPrimary?: boolean; color?: string }>;
  availableColors?: string[];
  availableSizes?: string[];
  variants?: ProductVariant[];
  allowedPrintMethodIds?: PrintMethodOption[];
}

// Helper function to convert color name to hex code
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'grey': '#808080',
    'gray': '#808080',
    'navy': '#000080',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'silver': '#C0C0C0',
    'gold': '#FFD700',
    'beige': '#F5F5DC',
    'tan': '#D2B48C',
    'khaki': '#F0E68C',
    'coral': '#FF7F50',
    'salmon': '#FA8072',
    'turquoise': '#40E0D0',
    'lavender': '#E6E6FA',
    'ivory': '#FFFFF0',
    'cream': '#FFFDD0',
    'mint': '#98FF98',
    'peach': '#FFE5B4',
    'cerulean frost': '#6D9BC3',
    'cerulean': '#6D9BC3',
    'cobalt blue': '#0047AB',
    'amber': '#FFBF00',
    'frosted': '#E8E8E8',
    'natural': '#FAF0E6',
    'beige-gray': '#9F9F9F',
    'clear': '#FFFFFF',
    'kraft': '#D4A574',
  };

  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#CCCCCC';
};

export const ProductInfoPanel: React.FC<{
  product: Product | null;
  isLoading: boolean;
  selectedColors?: string[];
  selectedSizes?: string[];
  selectedSizesByColor?: Record<string, string[]>;
  onColorToggle?: (color: string) => void;
  onSizeToggle?: (size: string) => void;
  onSizeToggleForColor?: (color: string, size: string) => void;
  onPrimaryColorHexChange?: (hex: string | null) => void;
  selectedPlaceholderId?: string | null;
  placeholders?: Array<{ id: string; x: number; y: number; width: number; height: number; rotation: number }>;
  designUrlsByPlaceholder?: Record<string, string>;
  displacementSettings?: { scaleX: number; scaleY: number; contrastBoost: number };
  onDisplacementSettingsChange?: (settings: any) => void;
  PX_PER_INCH?: number;
  selectedPrintMethodId?: string | null;
  onPrintMethodChange?: (id: string | null) => void;
  designAreaSqIn?: number;
  selectedPrintMethodsByView?: Record<string, string | null>;
  designAreaByView?: Record<string, number>;
  currentView?: string;
}> = ({
  product,
  isLoading,
  selectedColors = [],
  selectedSizes = [],
  selectedSizesByColor = {},
  onColorToggle,
  onSizeToggle,
  onSizeToggleForColor,
  onPrimaryColorHexChange,
  selectedPlaceholderId,
  placeholders = [],
  designUrlsByPlaceholder = {},
  displacementSettings,
  onDisplacementSettingsChange,
  PX_PER_INCH = 10,
  selectedPrintMethodId = null,
  onPrintMethodChange,
  designAreaSqIn,
  selectedPrintMethodsByView = {},
  designAreaByView = {},
  currentView = 'front',
}) => {
    const [expandedColor, setExpandedColor] = React.useState<string | null>(null);


    // Build a map of color names to hex values from variants
    const colorHexMap = useMemo(() => {
      const map: Record<string, string> = {};
      if (product?.variants) {
        product.variants.forEach((variant) => {
          if (variant.color && variant.colorHex) {
            map[variant.color] = variant.colorHex;
          }
        });
      }
      return map;
    }, [product?.variants]);

    // Get variant prices by color and size
    const variantPriceMap = useMemo(() => {
      const map: Record<string, Record<string, number>> = {};
      if (product?.variants) {
        product.variants.forEach((variant) => {
          if (variant.color && variant.size && variant.price !== undefined) {
            if (!map[variant.color]) {
              map[variant.color] = {};
            }
            map[variant.color][variant.size] = variant.price;
          }
        });
      }
      return map;
    }, [product?.variants]);

    // Calculate current price based on selected color and size (prioritize color-specific size)
    const currentPrice = useMemo(() => {
      if (selectedColors.length > 0) {
        const color = selectedColors[0];
        // Get color-specific sizes (array)
        const colorSpecificSizes = selectedSizesByColor[color] || [];
        if (colorSpecificSizes.length > 0) {
          // Use the first selected size for this color
          const price = variantPriceMap[color]?.[colorSpecificSizes[0]];
          if (price !== undefined) {
            return price;
          }
        }
        // Fallback to general size selection
        if (selectedSizes.length > 0) {
          const size = selectedSizes[0];
          const price = variantPriceMap[color]?.[size];
          if (price !== undefined) {
            return price;
          }
        }
      }
      return product?.catalogue?.basePrice;
    }, [selectedColors, selectedSizes, selectedSizesByColor, variantPriceMap, product?.catalogue?.basePrice]);

    // Get product image based on selected color
    const productImage = useMemo(() => {
      if (!product?.galleryImages || product.galleryImages.length === 0) return null;

      // Try to find image matching selected color
      if (selectedColors.length > 0) {
        const colorImage = product.galleryImages.find(
          img => img.color?.toLowerCase() === selectedColors[0].toLowerCase()
        );
        if (colorImage) return colorImage.url;
      }

      // Fallback to primary or first image
      return product.galleryImages.find(img => img.isPrimary)?.url || product.galleryImages[0]?.url;
    }, [product?.galleryImages, selectedColors]);

    // When selection changes, notify parent of the primary color's hex
    React.useEffect(() => {
      if (!onPrimaryColorHexChange) return;

      const primaryColor = selectedColors[0];
      if (!primaryColor) {
        onPrimaryColorHexChange(null);
        return;
      }

      const hexFromVariant = colorHexMap[primaryColor];
      const hex = hexFromVariant || getColorHex(primaryColor);
      onPrimaryColorHexChange(hex || null);
    }, [selectedColors, colorHexMap, onPrimaryColorHexChange]);

    // Get available sizes for a specific color
    const getSizesForColor = (color: string): string[] => {
      if (!product?.variants) return product?.availableSizes || [];
      const sizes = new Set<string>();
      product.variants.forEach(variant => {
        if (variant.color === color && variant.isActive !== false) {
          sizes.add(variant.size);
        }
      });
      return Array.from(sizes).sort();
    };

    // Get price for a specific color and size
    const getPriceForVariant = (color: string, size: string): number | undefined => {
      return variantPriceMap[color]?.[size] || product?.catalogue?.basePrice;
    };

    const allAvailableColors = product?.availableColors || [];
    const availableSizes = product?.availableSizes || [];

    // Filter colors that have at least one active variant (must be before early returns)
    const availableColors = useMemo(() => {
      if (!product?.variants) return allAvailableColors;
      return allAvailableColors.filter(color => {
        return product.variants?.some(v => v.color === color && v.isActive !== false);
      });
    }, [allAvailableColors, product?.variants]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!product) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p>No product data available</p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 p-4">

          {/* SELECT COLORS Section */}
          {availableColors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold uppercase text-foreground">
                  SELECT COLOR
                </Label>
                {selectedColors.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {selectedColors.length} selected
                  </span>
                )}
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-1 gap-2">
                {availableColors.map((color, index) => {
                  const colorSizes = selectedSizesByColor[color] || [];
                  const isColorSelected = selectedColors.includes(color) || colorSizes.length > 0;
                  const colorHex = colorHexMap[color] || getColorHex(color);
                  const isExpanded = expandedColor === color;
                  const sizesForColor = getSizesForColor(color);

                  // const colorSizes = selectedSizesByColor[color] || [];
                  const allSizesSelected =
                    sizesForColor.length > 0 &&
                    colorSizes.length === sizesForColor.length;

                  const someSizesSelected =
                    colorSizes.length > 0 && !allSizesSelected;

                  return (
                    <div key={index} className="space-y-2">
                      {/* Color Option (clickable header to expand/collapse) */}
                      <div
                        // <Checkbox>

                        className={`
                        flex items-center gap-2 p-2 rounded-md border-2
                        ${isColorSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }
                      `}
                        onClick={() => setExpandedColor(isExpanded ? null : color)}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                          style={{
                            backgroundColor: colorHex,
                            borderColor: color === 'White' || color === 'Clear' ? '#E5E7EB' : 'rgba(0, 0, 0, 0.2)',
                          }}
                        />
                        <span className="text-sm font-medium flex-1">{color}</span>
                        {sizesForColor.length > 0 && (
                          <div className="p-1">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded Size List for this Color */}
                      {isExpanded && sizesForColor.length > 0 && (
                        <div className="ml-8 space-y-1.5 border-l-2 border-primary/20 pl-3">

                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <Checkbox
                              checked={allSizesSelected}
                              onCheckedChange={() => {
                                if (!onSizeToggleForColor) return;

                                if (allSizesSelected) {
                                  // UNSELECT ALL
                                  sizesForColor.forEach((size) => {
                                    if (colorSizes.includes(size)) {
                                      onSizeToggleForColor(color, size);
                                    }
                                  });

                                  // Remove color highlight
                                  if (selectedColors.includes(color)) {
                                    onColorToggle?.(color);
                                  }
                                } else {
                                  // SELECT ALL
                                  sizesForColor.forEach((size) => {
                                    if (!colorSizes.includes(size)) {
                                      onSizeToggleForColor(color, size);
                                    }
                                  });

                                  // Ensure color is highlighted
                                  if (!selectedColors.includes(color)) {
                                    onColorToggle?.(color);
                                  }
                                }
                              }}
                            />
                            <span className="text-sm font-medium">Select all sizes</span>
                          </div>


                          {sizesForColor.map((size, sizeIndex) => {
                            // Get all selected sizes for this color (as an array)
                            const colorSizes = selectedSizesByColor[color] || [];
                            const isSizeSelected = colorSizes.includes(size);
                            const variantPrice = getPriceForVariant(color, size);

                            return (
                              <div
                                key={sizeIndex}
                                className={`
                                flex items-center justify-between gap-2 p-1.5 rounded cursor-pointer transition-all
                                ${isSizeSelected
                                    ? 'bg-primary/10 border-l-2 border-primary pl-2'
                                    : 'hover:bg-muted/50'
                                  }
                              `}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={isSizeSelected}
                                    onCheckedChange={() => {
                                      const newSelected = !isSizeSelected;
                                      const existingSizes = selectedSizesByColor[color] || [];

                                      // Update size selection for this color
                                      if (onSizeToggleForColor) {
                                        onSizeToggleForColor(color, size);
                                      } else {
                                        onSizeToggle?.(size);
                                      }

                                      // Auto-highlight color based on size selection
                                      if (newSelected) {
                                        if (!selectedColors.includes(color)) {
                                          onColorToggle?.(color);
                                        }
                                      } else {
                                        // If this was the last selected size for this color, remove color highlight
                                        if (existingSizes.length === 1 && selectedColors.includes(color)) {
                                          onColorToggle?.(color);
                                        }
                                      }
                                    }}
                                    className="cursor-pointer"
                                  />
                                  <span className="text-sm">{size}</span>
                                </div>
                                {variantPrice !== undefined && (
                                  <span className={`text-sm font-semibold ${isSizeSelected ? 'text-primary' : ''}`}>
                                    ₹{variantPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}




          {/* PRINT METHOD Section */}
          {product.allowedPrintMethodIds && product.allowedPrintMethodIds.length > 0 && (() => {
            const allMethods = product.allowedPrintMethodIds!;
            const blankCost = product.basePrice ?? product.catalogue?.basePrice ?? 0;

            // Helper: compute print cost for a method + area
            const computePrintCost = (pm: PrintMethodOption, area: number) => {
              const areaCharge = (pm.baseRatePaisePerSqIn ?? 0) * area;
              const extraColors = pm.hasColors ? Math.max(0, 1 - (pm.minColors ?? 1)) : 0;
              const colorCharge = pm.hasColors ? ((pm.colorRatePaise ?? 0) * extraColors) : 0;
              return Math.round(areaCharge + colorCharge) / 100;
            };

            // Get placeholder area for a specific view key
            const getPlaceholderArea = (viewKey: string) => {
              const viewData = (product.design?.views ?? []).find(v => v.key === viewKey);
              if (!viewData) return 0;
              return (viewData.placeholders ?? []).reduce((s, ph) => s + ((ph.widthIn ?? 0) * (ph.heightIn ?? 0)), 0);
            };

            // Views that have a selected method
            const configuredViews = Object.entries(selectedPrintMethodsByView)
              .filter(([, methodId]) => methodId != null)
              .map(([viewKey, methodId]) => {
                const pm = allMethods.find(m => m._id === methodId);
                if (!pm) return null;
                const area = (designAreaByView[viewKey] ?? 0) > 0
                  ? designAreaByView[viewKey]
                  : getPlaceholderArea(viewKey);
                const printCost = computePrintCost(pm, area);
                return { viewKey, pm, area, printCost };
              })
              .filter(Boolean) as Array<{ viewKey: string; pm: PrintMethodOption; area: number; printCost: number }>;

            const totalPrintCost = configuredViews.reduce((s, v) => s + v.printCost, 0);
            const grandTotal = blankCost + totalPrintCost;

            // Current view area
            const currentAreaActual = designAreaSqIn ?? 0;
            const currentAreaFallback = getPlaceholderArea(currentView);
            const currentArea = currentAreaActual > 0 ? currentAreaActual : currentAreaFallback;
            const currentAreaIsActual = currentAreaActual > 0;
            const approxSide = Math.sqrt(currentArea);

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold uppercase text-foreground">PRINT METHOD</Label>
                </div>

                {/* Cost summary — shown when at least one view has a selection */}
                {configuredViews.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 overflow-hidden text-xs">
                    <div className="px-3 py-2 bg-muted/50 font-semibold text-[11px] uppercase tracking-wide text-muted-foreground">
                      Cost Breakdown (per piece)
                    </div>
                    <div className="divide-y divide-border">
                      <div className="flex justify-between px-3 py-2 text-muted-foreground">
                        <span>Blank garment</span>
                        <span className="font-medium text-foreground">₹{blankCost.toFixed(2)}</span>
                      </div>
                      {configuredViews.map(({ viewKey, pm, printCost }) => (
                        <div key={viewKey} className="flex justify-between px-3 py-2">
                          <span className="text-muted-foreground capitalize">
                            {viewKey} <span className="text-foreground font-medium">· {pm.name}</span>
                          </span>
                          <span className="font-medium text-foreground">₹{printCost.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between px-3 py-2.5 bg-primary/5 font-semibold text-primary">
                        <span>Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current view section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {currentView} side
                    </span>
                    {currentArea > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                        currentAreaIsActual
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-muted bg-muted/40 text-muted-foreground'
                      }`}>
                        {approxSide.toFixed(1)}" × {approxSide.toFixed(1)}"
                        {currentAreaIsActual ? ' · your design' : ' · max area'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {allMethods.filter(pm => pm.active !== false && (selectedPrintMethodId === null || selectedPrintMethodId === pm._id)).map(pm => {
                      const isSelected = selectedPrintMethodId === pm._id;
                      const printCostRupees = computePrintCost(pm, currentArea);

                      return (
                        <button
                          key={pm._id}
                          type="button"
                          onClick={() => onPrintMethodChange?.(isSelected ? null : pm._id)}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors w-full ${
                            isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{pm.name}</span>
                              <span className="text-xs bg-muted rounded px-1.5 py-0.5 uppercase font-mono">{pm.code}</span>
                              {pm.moq > 1 && <span className="text-xs text-muted-foreground">MOQ: {pm.moq}</span>}
                            </div>
                            {pm.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pm.description}</p>
                            )}
                            {printCostRupees > 0 && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                Print cost: <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>₹{printCostRupees.toFixed(2)}</span>
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <Badge className="text-xs">Selected</Badge>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onPrintMethodChange?.(null); }}
                                className="text-[10px] text-muted-foreground underline hover:text-foreground"
                              >
                                Change
                              </button>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    );
  };
