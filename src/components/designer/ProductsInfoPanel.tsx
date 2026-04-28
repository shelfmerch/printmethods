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

interface PrintMethod {
  _id?: string;
  id?: string;
  name?: string;
  code?: string;
  active?: boolean;
  moq?: number;
  hasColors?: boolean;
  minColors?: number;
  maxColors?: number;
  baseRatePaisePerSqIn?: number;
  colorRatePaise?: number;
}

interface CurrentPrintArea {
  width: number;
  height: number;
  area: number;
}

// Store multiple sizes per color as Record<colorName, Set<size>>
// But pass/receive as Record<colorName, string[]> for serialization

interface Product {
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
      width?: number;
      height?: number;
      length?: number;
    };
  };
  galleryImages?: Array<{ url: string; isPrimary?: boolean; color?: string }>;
  availableColors?: string[];
  availableSizes?: string[];
  variants?: ProductVariant[];
  allowedPrintMethodIds?: Array<PrintMethod | string>;
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
  designAreaSqIn = 0,
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

    const activePrintMethods = useMemo(() => {
      return (product?.allowedPrintMethodIds || [])
        .filter((method) => {
          if (!method || typeof method === 'string') return !!method;
          return method.active !== false;
        });
    }, [product?.allowedPrintMethodIds]);

    const getPrintMethodId = (method: PrintMethod | string): string => {
      return typeof method === 'string' ? method : (method._id || method.id || method.code || method.name || '');
    };

    const getPrintMethodLabel = (method: PrintMethod | string): string => {
      if (typeof method === 'string') return method;
      const name = method.name || method.code || method._id || method.id || 'Print method';
      return method.code && method.name && method.code !== method.name ? `${method.name} (${method.code})` : name;
    };

    const getPrintMethodName = (method: PrintMethod | string): string => {
      return typeof method === 'string' ? method : (method.name || method.code || 'Print method');
    };

    const getPrintMethodCode = (method: PrintMethod | string): string | null => {
      return typeof method === 'string' ? null : (method.code || null);
    };

    const currentPrintArea = useMemo<CurrentPrintArea>(() => {
      const view = product?.design?.views?.find(v => v.key === currentView);
      const placeholdersForView = view?.placeholders || [];
      if (placeholdersForView.length === 0) {
        return { width: 0, height: 0, area: Math.max(0, designAreaByView[currentView] || designAreaSqIn || 0) };
      }

      const totalArea = placeholdersForView.reduce((sum, placeholder) => {
        return sum + ((placeholder.widthIn || 0) * (placeholder.heightIn || 0));
      }, 0);
      const first = placeholdersForView[0];
      return {
        width: first.widthIn || 0,
        height: first.heightIn || 0,
        area: totalArea,
      };
    }, [product?.design?.views, currentView, designAreaByView, designAreaSqIn]);

    const chargeableArea = Math.max(
      0,
      designAreaByView[currentView] || designAreaSqIn || currentPrintArea.area || 0
    );

    const getPrintMethodCost = (method: PrintMethod | string, area: number): number | null => {
      if (typeof method === 'string') return null;
      const areaCharge = (method.baseRatePaisePerSqIn ?? 0) * area;
      const extraColors = method.hasColors ? Math.max(0, 1 - (method.minColors ?? 1)) : 0;
      const colorCharge = method.hasColors ? ((method.colorRatePaise ?? 0) * extraColors) : 0;
      return Math.round(areaCharge + colorCharge) / 100;
    };

    const selectedPrintMethod = activePrintMethods.find(method => getPrintMethodId(method) === selectedPrintMethodId);
    const selectedMethodCost = selectedPrintMethod ? getPrintMethodCost(selectedPrintMethod, chargeableArea) : null;
    const selectedSidesCount = Object.values(selectedPrintMethodsByView).filter(Boolean).length;

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
                        flex items-center gap-3 px-3 py-3 rounded-md border-2 cursor-pointer transition-all
                        ${isColorSelected
                            ? 'border-[#22c55e] bg-[#22c55e]/5'
                            : 'border-border hover:border-[#22c55e]/60 hover:bg-muted/50'
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
                        <span className="text-base font-medium flex-1">{color}</span>
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

          {activePrintMethods.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold uppercase text-foreground">
                  PRINT METHOD
                </Label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {currentView} side
                </span>
                {currentPrintArea.width > 0 && currentPrintArea.height > 0 && (
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                    {currentPrintArea.width.toFixed(1)}&quot; x {currentPrintArea.height.toFixed(1)}&quot; · max area
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                {activePrintMethods.map((method) => {
                  const methodId = getPrintMethodId(method);
                  if (!methodId) return null;

                  const isSelected = selectedPrintMethodId === methodId;
                  const cost = getPrintMethodCost(method, chargeableArea);
                  const code = getPrintMethodCode(method);

                  return (
                    <button
                      key={methodId}
                      type="button"
                      onClick={() => onPrintMethodChange?.(isSelected ? null : methodId)}
                      className={`w-full rounded-md border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#22c55e] bg-[#22c55e]/5'
                          : 'border-border bg-background hover:border-[#22c55e]/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                          {getPrintMethodName(method)}
                        </span>
                        {code && (
                          <Badge variant="secondary" className="rounded px-2 py-0.5 text-[11px] font-medium">
                            {code}
                          </Badge>
                        )}
                        {typeof method !== 'string' && method.moq ? (
                          <span className="text-xs text-muted-foreground">MOQ: {method.moq}</span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Print cost:</span>
                        <span className="font-bold text-foreground">
                          {cost !== null ? `Rs ${cost.toFixed(2)}` : 'Unavailable'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activePrintMethods.length > 1 && !selectedPrintMethodId && (
                <p className="text-xs text-muted-foreground">
                  Choose a print method for this side to include it in product pricing.
                </p>
              )}

              {selectedMethodCost !== null && selectedPrintMethodId && (
                <p className="text-xs text-muted-foreground">
                  Current side decoration cost is Rs {selectedMethodCost.toFixed(2)}.
                </p>
              )}
            </div>
          )}




        </div>
      </div>
    );
  };
