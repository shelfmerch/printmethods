import { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { storeApi, storeProductsApi, catalogVariantsApi, shopifyApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Normalize key for matching: trim, lowercase, collapse spaces
const norm = (str: string): string => {
  return (str || '').trim().toLowerCase().replace(/\s+/g, '');
};

interface IncomingVariant {
  id?: string;
  size: string;
  color: string;
  sku?: string;
  // Optional fields passed from previous steps
  price?: number; // retail price / selling price suggestion
  productionCost?: number; // optional if already computed elsewhere
}

interface LocationState {
  storeProductId?: string; // Draft ID from DesignEditor
  productId?: string;
  baseSellingPrice?: number;
  title?: string;
  description?: string;
  galleryImages?: Array<{ id: string; url: string; position: number; isPrimary?: boolean; imageType?: string; altText?: string }>;
  designData?: any;
  variants?: IncomingVariant[];
}

interface VariantRow {
  id?: string;
  size: string;
  color: string;
  sku: string;
  retailPrice: number;
  productionCost: number;
  isActive?: boolean;
}

const ListingEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = location as { state: LocationState | null };

  // Get storeProductId from route query or state
  const storeProductId = searchParams.get('storeProductId') || state?.storeProductId;
  const [draftData, setDraftData] = useState<any>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [variantCostMap, setVariantCostMap] = useState<
    Record<string, { cost: number; id?: string; sku?: string; isActive?: boolean }>
  >({});

  // Load draft from database if storeProductId is provided
  useEffect(() => {
    if (storeProductId) {
      setIsLoadingDraft(true);
      storeProductsApi.getById(storeProductId)
        .then((response) => {
          if (response.success && response.data) {
            setDraftData(response.data);
            console.log('Loaded draft for editing:', response.data);
          } else {
            toast.error('Failed to load draft data');
          }
        })
        .catch((error) => {
          console.error('Error loading draft:', error);
          toast.error('Failed to load draft: ' + (error.message || 'Unknown error'));
        })
        .finally(() => {
          setIsLoadingDraft(false);
        });
    }
  }, [storeProductId]);

  // Get productId from state or draftData
  const productId = state?.productId || draftData?.catalogProductId;

  // Initialize title and description from draft or state
  const [title, setTitle] = useState(() => {
    return state?.title || draftData?.title || '';
  });
  const [description, setDescription] = useState(() => {
    return state?.description || '';
  });

  // Update title/description when draft loads
  useEffect(() => {
    if (draftData) {
      if (draftData.title) setTitle(draftData.title);
      // Only set description if it's not the catalog's size guide HTML
      if (draftData.description && !draftData.description.includes('class="size-guide"')) {
        setDescription(draftData.description);
      }
    }
  }, [draftData]);
  // const [addSizeTable, setAddSizeTable] = useState(false); // Removed as per requirements
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);
  const [hideInStore, setHideInStore] = useState(false);
  const [syncTitle, setSyncTitle] = useState(true);
  const [syncDescription, setSyncDescription] = useState(true);
  const [syncMockups, setSyncMockups] = useState(true);
  const [syncPricing, setSyncPricing] = useState(false);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  // Ref to track user-entered retail prices so they don't reset when cost map loads
  const retailPriceRef = useRef<Record<string, number>>({});

  // --- STORE SELECTION STATE ---
  interface ConnectedStore {
    _id: string;
    id?: string;
    name: string;
    subdomain?: string;
    status?: string;
  }
  const [connectedStores, setConnectedStores] = useState<ConnectedStore[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Fetch connected stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      try {
        const response = await storeApi.listMyStores();
        if (response.success && Array.isArray(response.data)) {
          setConnectedStores(response.data);
          // Pre-select all stores by default
          const allIds = new Set(response.data.map((s: any) => s._id || s.id));
          setSelectedStoreIds(allIds);
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        toast.error('Failed to load connected stores');
      } finally {
        setIsLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  // Fetch connected Shopify stores on mount
  useEffect(() => {
    const fetchShopifyStores = async () => {
      setIsShopifyLoading(true);
      try {
        const response = await shopifyApi.listConnectedShops();
        // apiRequest unwraps: backend { success, data } -> returns data (array). Handle both shapes.
        const list = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        if (list.length > 0) {
          setShopifyStores(list);
          setSelectedShop(list[0].shop);
        }
      } catch (error) {
        console.error('Failed to fetch Shopify stores:', error);
      } finally {
        setIsShopifyLoading(false);
      }
    };
    fetchShopifyStores();
  }, []);

  // Load catalog variant costs (production basePrice) and SKU template
  // for the specific catalog product backing this design.
  useEffect(() => {
    // Get productId from state OR draftData (draft may load later)
    const currentProductId = state?.productId || draftData?.catalogProductId;

    console.log('[ListingEditor] Fetch catalog variants:', {
      productId: currentProductId,
      fromState: state?.productId,
      fromDraft: draftData?.catalogProductId,
    });

    if (!currentProductId) {
      console.log('[ListingEditor] No productId available yet, skipping fetch');
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        console.log('[ListingEditor] Calling catalogVariantsApi.listByProduct:', currentProductId);
        const resp = await catalogVariantsApi.listByProduct(currentProductId);

        console.log('[ListingEditor] Raw API response:', {
          resp,
          respType: typeof resp,
          isArray: Array.isArray(resp),
          hasData: !!(resp as any)?.data,
          dataType: typeof (resp as any)?.data,
          dataIsArray: Array.isArray((resp as any)?.data),
        });

        // Handle various response shapes: resp.data, resp.data.data, or resp is array
        let data: any[] = [];
        if (Array.isArray(resp)) {
          data = resp;
        } else if (Array.isArray((resp as any)?.data)) {
          data = (resp as any).data;
        } else if (Array.isArray((resp as any)?.data?.data)) {
          data = (resp as any).data.data;
        }

        console.log('[ListingEditor] Extracted data array:', {
          length: data.length,
          sample: data[0],
          sampleFields: data[0] ? Object.keys(data[0]) : [],
        });

        if (!Array.isArray(data) || isCancelled) {
          console.warn('[ListingEditor] No valid data array, aborting');
          return;
        }

        const map: Record<string, { cost: number; id?: string; sku?: string; isActive?: boolean }> = {};
        data.forEach((v: any) => {
          // Normalize keys for matching
          const normalizedSize = norm(v.size || '');
          const normalizedColor = norm(v.color || '');
          const key = `${normalizedSize}__${normalizedColor}`;

          // Production cost: prefer basePrice (DB field), fallback to price (transformed)
          const basePrice = typeof v.basePrice === 'number' && Number.isFinite(v.basePrice)
            ? v.basePrice
            : undefined;
          const price = typeof v.price === 'number' && Number.isFinite(v.price)
            ? v.price
            : undefined;

          // Use basePrice if available, otherwise price
          const cost = basePrice !== undefined ? basePrice : (price !== undefined ? price : 0);

          const sku = v.sku || v.skuTemplate || '';

          map[key] = {
            cost,
            id: v._id || v.id,
            sku,
            isActive: v.isActive !== false, // Default to true if missing
          };
        });

        if (!isCancelled) {
          setVariantCostMap(map);
        }
      } catch (err) {
        console.error('[ListingEditor] Failed to load catalog variant costs:', err);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [productId, draftData?.catalogProductId]);

  // Initialize/recompute variantRows when incoming variants OR cost map changes
  // Preserve user-entered retailPrice using ref
  useEffect(() => {
    const incoming = state?.variants || [];
    const draftVariants = (draftData?.variantsSummary || draftData?.variants || []) as any[];

    console.log('[ListingEditor] Recompute variantRows:', {
      incomingCount: incoming.length,
      variantCostMapKeys: Object.keys(variantCostMap).length,
      existingRowsCount: variantRows.length,
      draftVariantsCount: draftVariants.length,
    });

    if (!incoming.length) {
      console.log('[ListingEditor] No incoming variants, skipping row creation');
      return;
    }

    const rows: VariantRow[] = incoming.map((v) => {
      // Normalize keys for matching
      const ns = norm(v.size || '');
      const nc = norm(v.color || '');
      const key = `${ns}__${nc}`;
      const mapped = variantCostMap[key];

      // Production cost from catalog
      const costFromCatalog = mapped?.cost;
      const costSource = Number.isFinite(costFromCatalog as number)
        ? (costFromCatalog as number)
        : Number.isFinite(v.productionCost as number)
          ? (v.productionCost as number)
          : 0;
      const cost = costSource || 0;

      // Retail price priority:
      // 1. User-entered (preserved in ref)
      // 2. Existing draft price (if editing)
      // 3. Default to cost (0 profit constraint)
      const rowKey = `${v.size}__${v.color}`;
      const preservedRetailPrice = retailPriceRef.current[rowKey];

      let defaultRetail = 0;
      if (preservedRetailPrice !== undefined && Number.isFinite(preservedRetailPrice)) {
        defaultRetail = preservedRetailPrice;
      } else {
        // Find existing match in draft data
        const existing = draftVariants.find(
          (dv) => norm(dv.size || '') === ns && norm(dv.color || '') === nc
        );
        if (existing && Number.isFinite(existing.sellingPrice)) {
          defaultRetail = existing.sellingPrice;
        } else {
          // Default to exactly cost (0 profit constraint applied automatically per requirements)
          defaultRetail = cost;
        }
      }

      const row: VariantRow = {
        id: mapped?.id || v.id,
        size: v.size,
        color: v.color,
        sku: mapped?.sku || v.sku || '',
        productionCost: parseFloat(cost.toFixed(2)),
        retailPrice: defaultRetail,
        isActive: mapped?.isActive !== false,
      };

      if (defaultRetail > 0 && !retailPriceRef.current[rowKey]) {
        // Only seed initially so manual zeroing is supported
        retailPriceRef.current[rowKey] = defaultRetail;
      }

      return row;
    });

    setVariantRows(rows);
  }, [state?.variants, variantCostMap, draftData]);

  // Update ref when user edits retail price
  useEffect(() => {
    variantRows.forEach((row) => {
      const rowKey = `${row.size}__${row.color}`;
      if (row.retailPrice > 0) {
        retailPriceRef.current[rowKey] = row.retailPrice;
      }
    });
  }, [variantRows]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // --- SHOPIFY PUBLISH STATE ---
  const [shopifyStores, setShopifyStores] = useState<Array<{ shop: string; isActive: boolean }>>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [isShopifyLoading, setIsShopifyLoading] = useState(false);
  const [isShopifyPublishing, setIsShopifyPublishing] = useState(false);
  const [shopifyResult, setShopifyResult] = useState<{ shopifyProductId: string } | null>(null);

  const hasVariantData = variantRows.length > 0;

  const pricingSummary = useMemo(() => {
    if (!variantRows.length) return null;

    const retailPrices = variantRows.map((v) => v.retailPrice).filter((v) => Number.isFinite(v));
    const costs = variantRows.map((v) => v.productionCost).filter((v) => Number.isFinite(v));

    if (!retailPrices.length || !costs.length) return null;

    const profits = variantRows.map((v) => v.retailPrice - v.productionCost);
    const margins = variantRows.map((v) => {
      if (!v.retailPrice || v.retailPrice <= 0) return 0;
      return (v.retailPrice - v.productionCost) / v.retailPrice;
    });

    const minRetail = Math.min(...retailPrices);
    const maxRetail = Math.max(...retailPrices);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    const avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;

    return {
      minRetail,
      maxRetail,
      minCost,
      maxCost,
      minProfit,
      maxProfit,
      avgMargin,
    };
  }, [variantRows]);

  const handleBack = () => {
    navigate(-1);
  };

  const saveProduct = async (targetStatus: 'published' | 'draft') => {
    if (!storeProductId) {
      toast.error('No draft ID available. Please start from Design Editor.');
      return;
    }

    // Validate store selection
    if (selectedStoreIds.size === 0) {
      toast.error(`Please select at least one store to ${targetStatus === 'published' ? 'publish' : 'save'} to.`);
      return;
    }

    if (targetStatus === 'published') {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      // Derive selected colors and sizes from variant rows
      const colors = Array.from(
        new Set(
          (variantRows || [])
            .map((v) => v.color)
            .filter((c): c is string => !!c && c.trim().length > 0),
        ),
      );
      const sizes = Array.from(
        new Set(
          (variantRows || [])
            .map((v) => v.size)
            .filter((s): s is string => !!s && s.trim().length > 0),
        ),
      );

      // Build base update payload
      const currentDesignData = draftData?.designData || state?.designData || {};
      const basePayload: any = {
        status: targetStatus,
        designData: {
          ...currentDesignData,
          ...(colors.length ? { selectedColors: colors } : {}),
          ...(sizes.length ? { selectedSizes: sizes } : {}),
        },
      };

      if (syncTitle) basePayload.title = title;
      if (syncDescription) basePayload.description = description;
      if (Array.isArray(state?.galleryImages)) basePayload.galleryImages = state.galleryImages;

      // Set selling price - use minimum of all variant retail prices for the "starting at" price
      const retailPrices = variantRows
        .map(v => v.retailPrice)
        .filter(p => typeof p === 'number' && p > 0);

      if (retailPrices.length > 0) {
        basePayload.sellingPrice = Math.min(...retailPrices);
      } else if (state?.baseSellingPrice) {
        basePayload.sellingPrice = state.baseSellingPrice;
      }

      // Build variants array
      if (variantRows && variantRows.length > 0) {
        basePayload.variants = variantRows
          .filter((v) => v.id)
          .map((v) => ({
            catalogProductVariantId: v.id,
            sku: v.sku || '',
            sellingPrice: v.retailPrice,
            isActive: true,
          }));
      }

      // If it's an existing edit, derive existing storeId accurately
      let targetStoreIdsArray = Array.from(selectedStoreIds);
      console.log(`[ListingEditor] ${targetStatus === 'published' ? 'Publishing' : 'Saving draft'} to targeted stores:`, targetStoreIdsArray);

      const catalogProductId = draftData?.catalogProductId || state?.productId;
      if (!catalogProductId) {
        toast.error('No catalog product ID available. Cannot save.');
        return;
      }

      // Track success/failure
      let successCount = 0;
      const errors: string[] = [];

      // For each targeted store, upsert (create or update) the StoreProduct
      for (const storeId of targetStoreIdsArray) {
        try {
          // Normalize IDs for comparison
          const currentStoreId = String(storeId).toLowerCase().trim();
          const originalStoreId = String(draftData?.storeId?._id || draftData?.storeId || '').toLowerCase().trim();

          // isExistingDraft is true if this store matches the store of the existing draft
          // OR if we only have one store selected and we're in edit mode (safer fallback)
          const isExistingDraft = !!storeProductId && (
            (originalStoreId !== '' && currentStoreId === originalStoreId) ||
            (targetStoreIdsArray.length === 1)
          );

          if (isExistingDraft && storeProductId) {
            // Update existing draft
            const updates = {
              ...basePayload,
              storeId,
              status: targetStatus,
            };
            const resp = await storeProductsApi.update(storeProductId, updates);
            if (resp && resp.success) {
              successCount++;
              console.log('[ListingEditor] Updated existing draft for store:', storeId);
            } else {
              errors.push(`Failed to update store ${storeId}`);
            }
          } else {
            // Create or update StoreProduct for this store
            const createPayload = {
              storeId,
              catalogProductId,
              sellingPrice: basePayload.sellingPrice || 0,
              title: basePayload.title,
              description: basePayload.description,
              designData: basePayload.designData,
              galleryImages: basePayload.galleryImages,
              variants: basePayload.variants,
              status: targetStatus,
            };

            console.log('[ListingEditor] Upserting StoreProduct for store:', storeId);
            const resp = await storeProductsApi.create(createPayload);
            if (resp && resp.success) {
              successCount++;
              console.log('[ListingEditor] Saved product to store:', storeId);
            } else {
              errors.push(`Failed to save to store ${storeId}`);
            }
          }
        } catch (err: any) {
          console.error('[ListingEditor] Error saving to store', storeId, err);
          errors.push(err?.message || `Failed for store ${storeId}`);
        }
      }

      // Report results
      if (successCount === targetStoreIdsArray.length) {
        if (targetStatus === 'published') {
          toast.success(`Product published to ${successCount} store${successCount > 1 ? 's' : ''}!`);
        } else {
          toast.success('Product saved as draft');
        }
      } else if (successCount > 0) {
        toast.warning(`Saved to ${successCount}/${targetStoreIdsArray.length} stores. ${errors.join(', ')}`);
      } else {
        toast.error('Failed to save: ' + errors.join(', '));
      }

      // Navigate if at least one succeeded
      if (successCount > 0) {
        if (targetStatus === 'published') {
          navigate('/stores', {
            state: {
              ...state,
              storeProductId,
              title,
              description,
              variantRows,
            }
          });
        } else {
          // Redirect to dashboard for drafts
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Save failed', err);
      toast.error(err?.message || 'Save failed');
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraft = () => {
    saveProduct('draft');
  };

  const handlePublish = () => {
    saveProduct('published');
  };

  // --- SHOPIFY PUBLISH HANDLER ---
  const handleShopifyPublish = async () => {
    if (!selectedShop) {
      toast.error('Please select a Shopify store');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!state?.galleryImages || state.galleryImages.length === 0 || !state.galleryImages[0]?.url) {
      toast.error('At least one gallery image is required');
      return;
    }
    if (variantRows.length === 0) {
      toast.error('At least one variant is required');
      return;
    }
    if (pricingSummary && pricingSummary.minProfit < 0) {
      toast.error('Cannot publish with negative profit');
      return;
    }

    setIsShopifyPublishing(true);
    setShopifyResult(null);

    try {
      const payload = {
        shop: selectedShop,
        storeProductId: storeProductId || undefined,
        title: title.trim(),
        description: description || '',
        galleryImages: state.galleryImages.map(img => ({ url: img.url })),
        variants: variantRows.map(r => ({
          size: r.size,
          color: r.color,
          sku: r.sku,
          price: r.retailPrice,
        })),
      };

      const response = await shopifyApi.publishProduct(payload);

      if (response.ok && response.shopifyProductId) {
        setShopifyResult({ shopifyProductId: response.shopifyProductId });
        toast.success(`Product published to Shopify! ID: ${response.shopifyProductId}`);
      } else {
        toast.error('Failed to publish to Shopify');
      }
    } catch (error: any) {
      console.error('Shopify publish error:', error);
      toast.error(error?.message || 'Failed to publish to Shopify');
    } finally {
      setIsShopifyPublishing(false);
    }
  };

  // Disable Shopify publish button conditions
  const isShopifyPublishDisabled =
    !selectedShop ||
    !title.trim() ||
    !state?.galleryImages ||
    state.galleryImages.length === 0 ||
    !state.galleryImages[0]?.url ||
    variantRows.length === 0 ||
    (pricingSummary !== null && pricingSummary.minProfit < 0) ||
    isShopifyPublishing;

  if (isLoadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading draft data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-fit gap-2 px-0 text-muted-foreground"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Listing editor</h1>
              <p className="text-sm text-muted-foreground">
                Configure listing details, pricing, and publishing options before pushing live.
              </p>
            </div>
          </div>
          {/* Publish action controls mapped separately per design requirements if needed */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Listing details */}
        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Listing details</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              A good listing title is clear, concise, and highlights key features to attract buyers and improve visibility.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter product title"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your product here... (e.g., This premium heavy-weight tee is made from 100% organic cotton, featuring a relaxed fit and durable double-stitch detailing. Perfect for a minimalist streetwear look.)"
              className="min-h-[200px] resize-none focus:ring-primary/20 transition-all border-slate-200"
              rows={8}
            />
          </div>
        </Card>

        {/* Personalization */}
        {/* <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Personalization</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Let buyers add custom requests for text, design, and more—on average, they are willing to pay extra for personalization.
              </p>
            </div>
            <Switch
              checked={personalizationEnabled}
              onCheckedChange={setPersonalizationEnabled}
              aria-label="Toggle personalization"
            />
          </div>
          {personalizationEnabled && (
            <Textarea
              placeholder="Add optional instructions or notes about personalization for your buyers."
              rows={4}
            />
          )}
        </Card> */}

        {/* Pricing */}
        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Pricing</h2>
            <p className="text-sm text-muted-foreground">
              Review retail prices, costs, and estimated profit for each variant.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Retail price</p>
              {pricingSummary ? (
                <p className="text-lg font-semibold">
                  ₹{pricingSummary.minRetail.toFixed(2)} - ₹{pricingSummary.maxRetail.toFixed(2)}
                </p>
              ) : (
                <p className="text-lg font-semibold">—</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Costs</p>
              {pricingSummary ? (
                <p className="text-lg font-semibold">
                  ₹{pricingSummary.minCost.toFixed(2)} - ₹{pricingSummary.maxCost.toFixed(2)}
                </p>
              ) : (
                <p className="text-lg font-semibold">—</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated profit</p>
              {pricingSummary ? (
                <p className="text-lg font-semibold">
                  ₹{pricingSummary.minProfit.toFixed(2)} - ₹{pricingSummary.maxProfit.toFixed(2)} ({
                    Math.round(pricingSummary.avgMargin * 100)
                  }
                  %)
                </p>
              ) : (
                <p className="text-lg font-semibold">—</p>
              )}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="detailed" className="w-full">
            <TabsContent value="detailed" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Retail price</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Profit margin</TableHead>
                    <TableHead>Production cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hasVariantData ? (
                    variantRows.filter((variant) => variant.isActive !== false).map((variant) => {
                      const profit = variant.retailPrice - variant.productionCost;
                      const margin =
                        variant.retailPrice > 0
                          ? Math.round((profit / variant.retailPrice) * 100)
                          : 0;

                      return (
                        <TableRow key={variant.id || `${variant.size}-${variant.color}-${variant.sku}`}>
                          <TableCell className="font-medium">{variant.size}</TableCell>
                          <TableCell>{variant.color}</TableCell>
                          <TableCell>
                            {variant.isActive === false ? (
                              <span className="text-destructive font-semibold">Out of stock</span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400">In stock</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">INR</span>
                              <Input
                                className="h-8 w-24"
                                value={(() => {
                                  const rowKey = `${variant.size}__${variant.color}`;
                                  const preserved = retailPriceRef.current[rowKey];
                                  if (preserved !== undefined && Number.isFinite(preserved)) {
                                    return preserved.toString();
                                  }
                                  return Number.isFinite(variant.retailPrice) && variant.retailPrice > 0
                                    ? variant.retailPrice.toString()
                                    : '';
                                })()}
                                inputMode="decimal"
                                onChange={(event) => {
                                  const rawValue = event.target.value;
                                  // Allow empty string, numbers, and single decimal point
                                  if (rawValue === '') {
                                    const rowKey = `${variant.size}__${variant.color}`;
                                    retailPriceRef.current[rowKey] = 0;
                                    setVariantRows((rows) =>
                                      rows.map((row) =>
                                        row === variant
                                          ? { ...row, retailPrice: 0 }
                                          : row,
                                      ),
                                    );
                                    return;
                                  }

                                  // Only allow numbers and decimal point
                                  const cleaned = rawValue.replace(/[^0-9.]/g, '');
                                  // Prevent multiple decimal points
                                  const parts = cleaned.split('.');
                                  const sanitized = parts.length > 2
                                    ? parts[0] + '.' + parts.slice(1).join('')
                                    : cleaned;

                                  // Update ref immediately with raw value (preserve user input)
                                  const rowKey = `${variant.size}__${variant.color}`;
                                  const parsed = parseFloat(sanitized);
                                  const numericValue = Number.isNaN(parsed) ? 0 : parsed;
                                  retailPriceRef.current[rowKey] = numericValue;

                                  // Update state with numeric value
                                  setVariantRows((rows) =>
                                    rows.map((row) =>
                                      row === variant
                                        ? { ...row, retailPrice: numericValue }
                                        : row,
                                    ),
                                  );
                                }}
                                onBlur={(event) => {
                                  // Format to 2 decimal places on blur
                                  const rowKey = `${variant.size}__${variant.color}`;
                                  const current = retailPriceRef.current[rowKey];
                                  if (current !== undefined && Number.isFinite(current)) {
                                    const formatted = parseFloat(current.toFixed(2));
                                    retailPriceRef.current[rowKey] = formatted;
                                    setVariantRows((rows) =>
                                      rows.map((row) =>
                                        row === variant
                                          ? { ...row, retailPrice: formatted }
                                          : row,
                                      ),
                                    );
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>INR {profit.toFixed(2)}</TableCell>
                          <TableCell>{margin}%</TableCell>
                          <TableCell>INR {variant.productionCost.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No variants received from Design editor. Publish from a designed product to configure pricing.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Publishing destination - Store Selection */}
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Publishing destination</h2>
            <p className="text-sm text-muted-foreground">
              Select which stores to publish this product to.
            </p>
          </div>

          {isLoadingStores ? (
            <div className="flex items-center gap-2 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading stores...</span>
            </div>
          ) : connectedStores.length > 0 ? (
            <div className="space-y-3">
              {connectedStores.map((store) => {
                const storeId = store._id || store.id || '';
                const isSelected = selectedStoreIds.has(storeId);
                return (
                  <label
                    key={storeId}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newSelectedIds = new Set(selectedStoreIds);
                        if (checked) {
                          newSelectedIds.add(storeId);
                        } else {
                          newSelectedIds.delete(storeId);
                        }
                        setSelectedStoreIds(newSelectedIds);
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{store.name}</p>
                      {store.subdomain && (
                        <p className="text-xs text-muted-foreground">{store.subdomain}.shelfmerch.com</p>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${store.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {store.status === 'active' ? 'Connected' : store.status || 'Publish'}
                    </span>
                  </label>
                );
              })}
              {selectedStoreIds.size === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Please select at least one store to publish to.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">No stores connected yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Go to Stores page to create or connect a store.
              </p>
            </div>
          )}
        </Card>

        {/* Publish to Shopify */}
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Publish to Shopify</h2>
            <p className="text-sm text-muted-foreground">
              Publish this product directly to your connected Shopify store as a draft.
            </p>
          </div>

          {isShopifyLoading ? (
            <div className="flex items-center gap-2 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading Shopify stores...</span>
            </div>
          ) : shopifyStores.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopify-store">Select Shopify store</Label>
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger id="shopify-store" className="w-full">
                    <SelectValue placeholder="Select a Shopify store" />
                  </SelectTrigger>
                  <SelectContent>
                    {shopifyStores.map((store) => (
                      <SelectItem key={store.shop} value={store.shop}>
                        {store.shop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleShopifyPublish}
                disabled={isShopifyPublishDisabled}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isShopifyPublishing ? 'Publishing to Shopify...' : 'Publish to Shopify'}
              </Button>

              {shopifyResult && (
                <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
                  <p className="font-medium">Successfully published to Shopify!</p>
                  <p className="text-xs mt-1">Product ID: {shopifyResult.shopifyProductId}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">No Shopify stores connected.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect your Shopify store to publish products directly.
              </p>
            </div>
          )}
        </Card>

        {/* Publishing settings */}
        {/* <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Publishing settings</h2>
            <p className="text-sm text-muted-foreground">
              Control product visibility and which details to sync when publishing to your store.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hideInStore"
                checked={hideInStore}
                onCheckedChange={(checked) => setHideInStore(!!checked)}
              />
              <Label htmlFor="hideInStore" className="text-sm font-normal">
                Hide in store
              </Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Sync product details</p>
            <p className="text-xs text-muted-foreground">
              Select which product details to sync and publish on your store. This will not impact SEO.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={syncTitle}
                  onCheckedChange={(checked) => setSyncTitle(!!checked)}
                />
                <span>Product title</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={syncDescription}
                  onCheckedChange={(checked) => setSyncDescription(!!checked)}
                />
                <span>Description</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={syncMockups}
                  onCheckedChange={(checked) => setSyncMockups(!!checked)}
                />
                <span>Mockups</span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={syncPricing}
                  onCheckedChange={(checked) => setSyncPricing(!!checked)}
                />
                <span>Colors, sizes, prices, and SKUs</span>
              </label>
            </div>
          </div> */}

        <div className="flex flex-col gap-3 pt-2">
          {pricingSummary && pricingSummary.minProfit < 0 && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 mb-1">
              <X className="w-4 h-4 flex-shrink-0" />
              <p>Profit cannot be negative. Please increase the retail price for all variants to be at least equal to the production cost.</p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isPublishing || (pricingSummary !== null && pricingSummary.minProfit < 0)}
            >
              {isSavingDraft ? 'Saving...' : 'Save as draft'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isSavingDraft || isPublishing || (pricingSummary !== null && pricingSummary.minProfit < 0)}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
        {/* </Card> */}
      </main>
    </div>
  );
};

export default ListingEditor;
