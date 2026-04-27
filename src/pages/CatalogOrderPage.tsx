import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RAW_API_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, Upload, X, ExternalLink, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

interface Placeholder {
  id: string;
  xIn: number;
  yIn: number;
  widthIn: number;
  heightIn: number;
  rotationDeg?: number;
  scale?: number;
}

interface DesignView {
  key: 'front' | 'back' | 'left' | 'right';
  mockupImageUrl: string;
  placeholders: Placeholder[];
}

interface PrintMethod {
  _id: string;
  name: string;
  code: string;
  moq?: number;
}

interface Variant {
  _id: string;
  color: string;
  colorHex: string;
  size: string;
}

interface PricingTier {
  minQuantity: number;
  discountType: string;
  discountValue: number;
  useSpecificPrice?: boolean;
  specificPriceTaxExcl?: number;
}

interface Product {
  _id: string;
  name: string;
  shortDescription?: string;
  basePrice: number;
  currency: string;
  minimumQuantity: number;
  galleryImages?: { url: string; isPrimary?: boolean }[];
  design?: {
    views: DesignView[];
    physicalDimensions?: { width?: number; height?: number };
  };
  colors: { color: string; colorHex: string }[];
  sizes: string[];
  variants: Variant[];
  printMethods: PrintMethod[];
  pricingTiers: PricingTier[];
}

interface CartRow {
  color: string;
  colorHex: string;
  sizes: Record<string, number>;
}

type ViewKey = 'front' | 'back' | 'sleeve';

interface MockupMetrics {
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
  naturalWidth: number;
  naturalHeight: number;
}

const DEFAULT_TIERS: PricingTier[] = [
  { minQuantity: 10, discountType: 'percentage', discountValue: 5 },
  { minQuantity: 20, discountType: 'percentage', discountValue: 6 },
  { minQuantity: 100, discountType: 'percentage', discountValue: 10 },
];

const CatalogOrderPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewKey>('front');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cart, setCart] = useState<CartRow[]>([]);
  const [designs, setDesigns] = useState<Record<string, File | null>>({});
  const [designPreviews, setDesignPreviews] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const previewUrls = useRef<Record<string, string>>({});
  const mockupContainerRef = useRef<HTMLDivElement | null>(null);
  const [mockupMetrics, setMockupMetrics] = useState<Record<string, MockupMetrics>>({});

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res = await fetch(`${RAW_API_URL}/api/catalog/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          if (data.data.printMethods?.length > 0) {
            setSelectedMethod(data.data.printMethods[0]._id);
          }
        } else {
          toast.error('Product not found');
          navigate('/products');
        }
      } catch {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      Object.values(previewUrls.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, [productId, navigate]);

  // Get the mockup image URL for a given view key using design.views (real data)
  const getViewImage = (viewKey: ViewKey): string | undefined => {
    if (!product) return undefined;
    const mapped = viewKey === 'sleeve' ? 'left' : viewKey;
    const designView = product.design?.views?.find(v => v.key === mapped);
    if (designView?.mockupImageUrl) return designView.mockupImageUrl;
    // fallback to gallery
    const idx = viewKey === 'front' ? 0 : viewKey === 'back' ? 1 : 2;
    return product.galleryImages?.[idx]?.url || product.galleryImages?.[0]?.url;
  };

  // Get overlay position from real placeholder data
  const getOverlayStyle = (viewKey: ViewKey): React.CSSProperties | null => {
    if (!product?.design) return null;
    const mapped = viewKey === 'sleeve' ? 'left' : viewKey;
    const designView = product.design.views?.find(v => v.key === mapped);
    if (!designView || !designView.placeholders?.length) return null;

    const ph = designView.placeholders[0];
    const physW = product.design.physicalDimensions?.width;
    const physH = product.design.physicalDimensions?.height;
    const metrics = mockupMetrics[viewKey];
    if (!physW || !physH || !ph.widthIn || !ph.heightIn || !metrics) return null;

    const scale = ph.scale && ph.scale > 0 ? ph.scale : 1;
    const top = metrics.offsetY + metrics.renderedHeight * (ph.yIn / physH);
    const left = metrics.offsetX + metrics.renderedWidth * (ph.xIn / physW);
    const width = metrics.renderedWidth * ((ph.widthIn * scale) / physW);
    const height = metrics.renderedHeight * ((ph.heightIn * scale) / physH);

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      overflow: 'hidden',
      transform: ph.rotationDeg ? `rotate(${ph.rotationDeg}deg)` : undefined,
      transformOrigin: 'top left',
    };
  };

  const updateMockupMetrics = (
    viewKey: ViewKey,
    naturalWidth: number,
    naturalHeight: number
  ) => {
    const container = mockupContainerRef.current;
    if (!container || !naturalWidth || !naturalHeight) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (!containerWidth || !containerHeight) return;

    const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;
    const offsetX = (containerWidth - renderedWidth) / 2;
    const offsetY = (containerHeight - renderedHeight) / 2;

    setMockupMetrics(prev => {
      const nextMetrics = {
        renderedWidth,
        renderedHeight,
        offsetX,
        offsetY,
        naturalWidth,
        naturalHeight,
      };
      const current = prev[viewKey];
      if (
        current &&
        current.renderedWidth === nextMetrics.renderedWidth &&
        current.renderedHeight === nextMetrics.renderedHeight &&
        current.offsetX === nextMetrics.offsetX &&
        current.offsetY === nextMetrics.offsetY &&
        current.naturalWidth === nextMetrics.naturalWidth &&
        current.naturalHeight === nextMetrics.naturalHeight
      ) {
        return prev;
      }

      return {
        ...prev,
        [viewKey]: nextMetrics,
      };
    });
  };

  useEffect(() => {
    const metrics = mockupMetrics[activeView];
    if (!metrics) return;

    const handleResize = () => {
      updateMockupMetrics(activeView, metrics.naturalWidth, metrics.naturalHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeView, mockupMetrics]);

  const availableViews: ViewKey[] = (() => {
    if (!product?.design?.views) return ['front'];
    const keys = product.design.views.map(v => v.key);
    const result: ViewKey[] = [];
    if (keys.includes('front')) result.push('front');
    if (keys.includes('back')) result.push('back');
    if (keys.includes('left') || keys.includes('right')) result.push('sleeve');
    return result.length ? result : ['front'];
  })();

  const toggleColor = (color: string, colorHex: string) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        setCart(c => c.filter(r => r.color !== color));
        return prev.filter(c => c !== color);
      }
      setCart(c => [...c, { color, colorHex, sizes: {} }]);
      return [...prev, color];
    });
  };

  const updateQty = (color: string, size: string, value: string) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setCart(prev =>
      prev.map(row =>
        row.color === color ? { ...row, sizes: { ...row.sizes, [size]: qty } } : row
      )
    );
  };

  const handleDesignUpload = (view: ViewKey, file: File | null) => {
    setDesigns(prev => ({ ...prev, [view]: file }));
    if (file && file.type.startsWith('image/')) {
      if (previewUrls.current[view]) URL.revokeObjectURL(previewUrls.current[view]);
      const url = URL.createObjectURL(file);
      previewUrls.current[view] = url;
      setDesignPreviews(prev => ({ ...prev, [view]: url }));
      setActiveView(view);
    } else if (!file) {
      if (previewUrls.current[view]) {
        URL.revokeObjectURL(previewUrls.current[view]);
        delete previewUrls.current[view];
      }
      setDesignPreviews(prev => { const n = { ...prev }; delete n[view]; return n; });
    }
  };

  const totalQty = cart.reduce(
    (sum, row) => sum + Object.values(row.sizes).reduce((s, q) => s + q, 0), 0
  );

  const tiers = product && product.pricingTiers.length > 0 ? product.pricingTiers : DEFAULT_TIERS;
  const unitPrice = product ? getPriceForQty(product.basePrice, tiers, totalQty) : 0;
  const subtotal = totalQty * unitPrice;

  const handleAddToCart = async () => {
    if (!product) return;
    if (totalQty === 0) { toast.error('Add at least one item'); return; }
    if (product.minimumQuantity > 1 && totalQty < product.minimumQuantity) {
      toast.error(`Minimum order is ${product.minimumQuantity} pieces`); return;
    }

    setAdding(true);
    try {
      const uploadedUrls: Record<string, string> = {};
      const token = localStorage.getItem('token');
      if (token) {
        for (const view of (['front', 'back', 'sleeve'] as ViewKey[])) {
          const file = designs[view];
          if (!file) continue;
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(`${RAW_API_URL}/api/upload/image`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const d = await res.json();
          if (d.success && d.url) uploadedUrls[view] = d.url;
        }
      }

      const items = [];
      for (const row of cart) {
        for (const [size, qty] of Object.entries(row.sizes)) {
          if (!qty) continue;
          const variant = product.variants.find(v => v.color === row.color && v.size === size);
          const method = product.printMethods.find(m => m._id === selectedMethod);
          items.push({
            catalogProductId: product._id,
            productName: product.name,
            variantId: variant?._id,
            color: row.color,
            colorHex: row.colorHex,
            size,
            quantity: qty,
            unitPrice,
            decorationMethodId: selectedMethod || undefined,
            decorationMethodName: method?.name,
            uploadedDesignUrls: Object.values(uploadedUrls),
            primaryImage: getViewImage('front'),
          });
        }
      }

      if (!items.length) { toast.error('No items to add'); return; }

      const existing = JSON.parse(localStorage.getItem('catalogCart') || '[]');
      const merged = [...existing];
      for (const item of items) {
        const idx = merged.findIndex(
          (e: typeof item) => e.catalogProductId === item.catalogProductId && e.color === item.color && e.size === item.size
        );
        if (idx >= 0) merged[idx].quantity += item.quantity;
        else merged.push(item);
      }
      localStorage.setItem('catalogCart', JSON.stringify(merged));
      toast.success(`${totalQty} items added`);

      if (!user) {
        sessionStorage.setItem('returnTo', '/direct-checkout');
        navigate('/auth');
      } else {
        navigate('/direct-checkout');
      }
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const activeImg = getViewImage(activeView);
  const overlayStyle = getOverlayStyle(activeView);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT — product image with design overlay */}
          <div>
            {/* View tabs — only show views that have real mockup images */}
            {availableViews.length > 1 && (
              <div className="flex gap-2 mb-3">
                {availableViews.map(view => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      activeView === view
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 text-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                    {designPreviews[view] && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Mockup image + overlay */}
            <div
              ref={mockupContainerRef}
              className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden"
            >
              {activeImg ? (
                <img
                  src={activeImg}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onLoad={(event) => {
                    updateMockupMetrics(
                      activeView,
                      event.currentTarget.naturalWidth,
                      event.currentTarget.naturalHeight
                    );
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👕</div>
              )}

              {/* Design overlay using real placeholder coordinates */}
              {designPreviews[activeView] && overlayStyle && (
                <div className="absolute pointer-events-none" style={overlayStyle}>
                  <img
                    src={designPreviews[activeView]}
                    alt="Your design"
                    className="w-full h-full object-contain opacity-90 drop-shadow-md"
                  />
                </div>
              )}

              {/* Fallback overlay (centered) when no placeholder data */}
              {designPreviews[activeView] && !overlayStyle && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={designPreviews[activeView]}
                    alt="Your design"
                    className="w-1/3 h-auto object-contain opacity-90 drop-shadow-md"
                  />
                </div>
              )}

              {designPreviews[activeView] && (
                <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  Design preview — {activeView}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {availableViews.length > 1 && (
              <div className="flex gap-2 mt-3">
                {availableViews.map(view => {
                  const img = getViewImage(view);
                  return (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-100 ${
                        activeView === view ? 'border-black' : 'border-transparent'
                      }`}
                    >
                      {img ? (
                        <img src={img} alt={view} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-400 capitalize">{view}</span>
                      )}
                      {designPreviews[view] && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — config */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.shortDescription && (
                <p className="text-gray-500 mt-1 text-sm">{product.shortDescription}</p>
              )}
              <p className="text-xl font-semibold mt-2">
                ₹{unitPrice.toFixed(2)}/pc
                {totalQty > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    × {totalQty} = ₹{subtotal.toFixed(2)}
                  </span>
                )}
              </p>
              {product.minimumQuantity > 1 && (
                <p className="text-sm text-orange-600 mt-0.5">Minimum order: {product.minimumQuantity} pcs</p>
              )}
            </div>

            {/* Volume Pricing Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Volume Pricing</h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Quantity</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Price/pc</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const firstMin = tiers[0]?.minQuantity ?? Infinity;
                      const isActive = totalQty < firstMin;
                      return (
                        <tr className={`border-t border-gray-100 ${isActive ? 'bg-green-50' : ''}`}>
                          <td className={`px-3 py-2 font-medium ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
                            1–{firstMin - 1} pcs {isActive && <span className="text-xs text-green-600">← you</span>}
                          </td>
                          <td className={`px-3 py-2 font-semibold ${isActive ? 'text-green-800' : ''}`}>
                            ₹{product.basePrice.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-gray-400">—</td>
                        </tr>
                      );
                    })()}
                    {tiers.map((tier, i) => {
                      const nextMin = tiers[i + 1]?.minQuantity;
                      const label = nextMin ? `${tier.minQuantity}–${nextMin - 1} pcs` : `${tier.minQuantity}+ pcs`;
                      const price = getPriceForTier(product.basePrice, tier);
                      const isActive = totalQty >= tier.minQuantity && (!nextMin || totalQty < nextMin);
                      return (
                        <tr key={tier.minQuantity} className={`border-t border-gray-100 ${isActive ? 'bg-green-50' : ''}`}>
                          <td className={`px-3 py-2 font-medium ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
                            {label} {isActive && <span className="text-xs text-green-600">← you</span>}
                          </td>
                          <td className={`px-3 py-2 font-semibold ${isActive ? 'text-green-800' : ''}`}>
                            ₹{price.toFixed(2)}
                          </td>
                          <td className={`px-3 py-2 ${isActive ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                            {tier.discountType === 'percentage' ? `${tier.discountValue}% off` : `Save ₹${(product.basePrice - price).toFixed(0)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Select Colors
                {selectedColors.length > 0 && <span className="text-gray-400 font-normal ml-1">({selectedColors.length} selected)</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button
                    key={c.color}
                    onClick={() => toggleColor(c.color, c.colorHex)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                      selectedColors.includes(c.color) ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: c.colorHex || '#ccc' }} />
                    {c.color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size × Qty grid */}
            {selectedColors.length > 0 && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity per Size</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-1 pr-4 text-gray-500 font-medium">Color</th>
                        {product.sizes.map(s => (
                          <th key={s} className="text-center py-1 px-2 text-gray-500 font-medium w-16">{s}</th>
                        ))}
                        <th className="text-right py-1 pl-4 text-gray-500 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(row => (
                        <tr key={row.color} className="border-t border-gray-100">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: row.colorHex || '#ccc' }} />
                              <span className="text-xs">{row.color}</span>
                            </div>
                          </td>
                          {product.sizes.map(s => (
                            <td key={s} className="py-2 px-2 text-center">
                              <Input
                                type="number" min={0}
                                value={row.sizes[s] || ''}
                                onChange={e => updateQty(row.color, s, e.target.value)}
                                className="w-14 h-7 text-center text-xs px-1"
                                placeholder="0"
                              />
                            </td>
                          ))}
                          <td className="py-2 pl-4 text-right text-xs font-medium">
                            {Object.values(row.sizes).reduce((s, q) => s + q, 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {totalQty > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td className="pt-2 text-xs font-semibold text-gray-700">Total</td>
                          {product.sizes.map(s => (
                            <td key={s} className="pt-2 text-center text-xs font-medium">
                              {cart.reduce((sum, row) => sum + (row.sizes[s] || 0), 0) || ''}
                            </td>
                          ))}
                          <td className="pt-2 text-right text-sm font-bold">{totalQty}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* Decoration method */}
            {product.printMethods.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Decoration Method</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.printMethods.map(pm => (
                    <button
                      key={pm._id}
                      onClick={() => setSelectedMethod(pm._id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedMethod === pm._id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <p className="text-sm font-medium">{pm.name}</p>
                      {pm.moq && pm.moq > 1 && (
                        <p className={`text-xs mt-0.5 ${selectedMethod === pm._id ? 'text-gray-300' : 'text-gray-400'}`}>
                          MOQ: {pm.moq}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Design upload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-700">Upload Design</h3>
                {productId && (
                  <a href={`/designer/${productId}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    Open in Designer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Upload your logo per position — preview appears on the mockup above.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {availableViews.map(view => (
                  <DesignUploadSlot
                    key={view}
                    view={view}
                    file={designs[view] || null}
                    preview={designPreviews[view]}
                    isActive={activeView === view}
                    onChange={file => handleDesignUpload(view, file)}
                    onClick={() => setActiveView(view)}
                  />
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleAddToCart}
              disabled={adding || totalQty === 0}
              className="w-full h-12 text-base"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
              {totalQty > 0 ? `Proceed to Checkout — ${totalQty} pcs · ₹${subtotal.toFixed(2)}` : 'Select colors & quantities'}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const DesignUploadSlot = ({
  view, file, preview, isActive, onChange, onClick,
}: {
  view: ViewKey; file: File | null; preview?: string;
  isActive: boolean; onChange: (f: File | null) => void; onClick: () => void;
}) => (
  <div className="relative" onClick={onClick}>
    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-3 cursor-pointer text-center transition-colors ${
      file ? 'border-green-400 bg-green-50' : isActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
    }`}>
      <input type="file" accept="image/png,image/jpeg,image/svg+xml,.pdf" className="hidden"
        onChange={e => onChange(e.target.files?.[0] ?? null)} />
      {preview ? (
        <>
          <img src={preview} alt="" className="w-10 h-10 object-contain mb-1" />
          <span className="text-xs text-green-700 truncate w-full text-center">
            {file && file.name.length > 10 ? file.name.slice(0, 9) + '…' : file?.name}
          </span>
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500 mt-1 capitalize">{view}</span>
        </>
      )}
    </label>
    {file && (
      <button onClick={e => { e.stopPropagation(); onChange(null); }}
        className="absolute -top-1.5 -right-1.5 bg-white rounded-full border border-gray-300 p-0.5">
        <X className="h-3 w-3 text-gray-500" />
      </button>
    )}
  </div>
);

function getPriceForQty(basePrice: number, tiers: PricingTier[], qty: number): number {
  const applicable = [...tiers].filter(t => qty >= t.minQuantity).sort((a, b) => b.minQuantity - a.minQuantity);
  return applicable.length ? getPriceForTier(basePrice, applicable[0]) : basePrice;
}

function getPriceForTier(basePrice: number, tier: PricingTier): number {
  if (tier.useSpecificPrice && tier.specificPriceTaxExcl != null) return tier.specificPriceTaxExcl;
  if (tier.discountType === 'percentage') return basePrice * (1 - tier.discountValue / 100);
  if (tier.discountType === 'amount') return basePrice - tier.discountValue;
  return basePrice;
}

export default CatalogOrderPage;
