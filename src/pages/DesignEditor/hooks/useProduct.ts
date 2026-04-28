import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { productApi, storeProductsApi } from '@/lib/api';
import { fetchWithApiAuth } from '@/lib/api';
import { getCachedImage, _tintCache } from '../engine/imageUtils';
import {
  DEFAULT_PRINT_METHOD,
  normalizePrintMethodId,
  type PrintMethodId,
} from '@/config/printMethods';
import type { CanvasElement, HistoryState, Placeholder, ProductView, Product } from '@/types/editor';
import type { DisplacementSettings, DesignPlacement, ViewKey } from '@/types/product';
import { pixelsToNormalized, type PrintAreaPixels } from '@/lib/placementUtils';

interface UseProductOptions {
  id: string | undefined;
  searchParams: URLSearchParams;
  // Canvas constants needed by loadMockupForView and PX_PER_INCH
  canvasWidth: number;
  canvasHeight: number;
  effectiveCanvasWidth: number;
  effectiveCanvasHeight: number;
  canvasPadding: number;
  // Callbacks into sibling state owners
  setStageSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  setUndoStack: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  setHasUnsavedChanges: (value: boolean) => void;
  registerEditActivity: () => void;
}

/**
 * Manages all product-related state: fetching, views, mockup images,
 * color/size selection, print method, design URLs, placements, previews,
 * and sessionStorage restoration.
 *
 * Extracted from DesignEditor.tsx lines 483–1253 (product + view state block).
 */
export const useProduct = ({
  id,
  searchParams,
  canvasWidth,
  canvasHeight,
  effectiveCanvasWidth,
  effectiveCanvasHeight,
  canvasPadding,
  setStageSize,
  setElements,
  setUndoStack,
  setRedoStack,
  setHasUnsavedChanges,
  registerEditActivity,
}: UseProductOptions) => {
  // ── Core product ───────────────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // ── Active view ────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<'front' | 'back' | 'sleeves'>('front');

  // ── Mockup images (keyed by view) ──────────────────────────────────────────
  const [mockupImagesByView, setMockupImagesByView] = useState<Record<string, HTMLImageElement | null>>({});
  const [imageSizesByView, setImageSizesByView] = useState<Record<string, { width: number; height: number; x: number; y: number }>>({});

  // ── Variants ───────────────────────────────────────────────────────────────
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSizesByColor, setSelectedSizesByColor] = useState<Record<string, string[]>>({});
  const [primaryColorHex, setPrimaryColorHex] = useState<string | null>(null);

  // ── Print method ───────────────────────────────────────────────────────────
  const [printMethod, setPrintMethod] = useState<PrintMethodId>(DEFAULT_PRINT_METHOD);

  // ── Store product ──────────────────────────────────────────────────────────
  const [storeProductId, setStoreProductId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // ── Displacement settings ──────────────────────────────────────────────────
  const [displacementSettings, setDisplacementSettings] = useState<DisplacementSettings>({
    scaleX: 20,
    scaleY: 20,
    contrastBoost: 1.5,
  });

  // ── Preview / mockup images ────────────────────────────────────────────────
  const [savedPreviewImages, setSavedPreviewImages] = useState<Record<string, string>>({});
  const [savedMockupPreviews, setSavedMockupPreviews] = useState<Record<string, string>>({});
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});

  // ── Dirty flags ────────────────────────────────────────────────────────────
  const [dirtyViewsForColor, setDirtyViewsForColor] = useState<Set<string>>(new Set());
  const [dirtyViewsForDesign, setDirtyViewsForDesign] = useState<Set<string>>(new Set());

  // ── Design URLs / placements ───────────────────────────────────────────────
  const [designUrlsByPlaceholder, setDesignUrlsByPlaceholder] = useState<Record<string, Record<string, string>>>({});
  const [placementsByView, setPlacementsByView] = useState<Record<string, Record<string, DesignPlacement>>>({});

  // ── Selected placeholder ───────────────────────────────────────────────────
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);
  const selectedPlaceholderIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedPlaceholderIdRef.current = selectedPlaceholderId;
    console.log('selectedPlaceholderId updated:', selectedPlaceholderId);
  }, [selectedPlaceholderId]);

  // ── Session restore gate ───────────────────────────────────────────────────
  const restoredFromSessionRef = useRef(false);

  // ── loadMockupForView ──────────────────────────────────────────────────────
  const loadMockupForView = useCallback(
    (viewKey: string, views: ProductView[]) => {
      const alreadyLoaded = mockupImagesByView[viewKey];
      if (alreadyLoaded) return;

      const view = views.find((v: ProductView) => v.key === viewKey);
      const mockupUrl = view?.mockupImageUrl;

      if (!mockupUrl) {
        console.warn(`No mockup image found for ${viewKey} view`);
        setMockupImagesByView(prev => ({ ...prev, [viewKey]: null }));
        setImageSizesByView(prev => ({ ...prev, [viewKey]: { width: 0, height: 0, x: 0, y: 0 } }));
        return;
      }

      getCachedImage(mockupUrl)
        .then(img => {
          // Evict stale tint-cache entries built from a previously tainted copy
          Array.from(_tintCache.keys())
            .filter(k => k.startsWith(img.src))
            .forEach(k => _tintCache.delete(k));

          setMockupImagesByView(prev => ({ ...prev, [viewKey]: img }));

          const aspectRatio = img.width / img.height;
          const maxWidth = effectiveCanvasWidth;
          const maxHeight = effectiveCanvasHeight;
          let width = maxWidth;
          let height = maxWidth / aspectRatio;
          if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }

          const x = canvasPadding + (maxWidth - width) / 2;
          const y = canvasPadding + (maxHeight - height) / 2;
          const calculatedSize = { width, height, x, y };

          setImageSizesByView(prev => ({ ...prev, [viewKey]: calculatedSize }));
          setStageSize({ width: canvasWidth, height: canvasHeight });

          console.log(`Mockup loaded for ${viewKey}:`, {
            original: { width: img.width, height: img.height },
            displayed: calculatedSize,
          });
        })
        .catch(() => {
          toast.error(`Failed to load mockup image for ${viewKey} view`);
          setMockupImagesByView(prev => ({ ...prev, [viewKey]: null }));
          setImageSizesByView(prev => ({ ...prev, [viewKey]: { width: 0, height: 0, x: 0, y: 0 } }));
        });
    },
    [effectiveCanvasWidth, effectiveCanvasHeight, canvasPadding, canvasWidth, canvasHeight, mockupImagesByView, setStageSize],
  );

  // ── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) { setIsLoadingProduct(false); return; }
      try {
        setIsLoadingProduct(true);
        const response = await productApi.getById(id);
        if (response && response.data) {
          console.log('Fetched product data:', {
            product: response.data,
            design: response.data.design,
            views: response.data.design?.views,
            physicalDimensions: response.data.design?.physicalDimensions,
          });

          setProduct(response.data);
          const previews = (response.data.design as any)?.previewImages || {};
          if (previews && typeof previews === 'object') setSavedPreviewImages(previews);

          if (response.data.design?.views) {
            loadMockupForView(currentView, response.data.design.views);
            response.data.design.views.forEach((v: ProductView) => {
              if (v.key !== currentView && v.mockupImageUrl) {
                getCachedImage(v.mockupImageUrl).catch(() => { });
              }
            });
          }

          if (response.data.design?.displacementSettings) {
            setDisplacementSettings(response.data.design.displacementSettings);
          }

          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product data');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Print method from catalogue ────────────────────────────────────────────
  useEffect(() => {
    if (!product?.catalogue) return;
    const cat = product.catalogue as {
      categoryId?: string;
      availablePrintMethods?: unknown;
      defaultPrintMethod?: unknown;
    };
    const raw = cat.availablePrintMethods;
    let allowed: PrintMethodId[] = [DEFAULT_PRINT_METHOD];
    if (Array.isArray(raw) && raw.length > 0) {
      const ids = raw.map((x) => normalizePrintMethodId(x)).filter(Boolean) as PrintMethodId[];
      if (ids.length) allowed = ids;
    } else if (cat.categoryId === 'apparel') {
      allowed = ['DTG', 'DTF', 'EMBROIDERY'];
    }
    const fromUrl = normalizePrintMethodId(searchParams.get('printMethod'));
    const def = normalizePrintMethodId(cat.defaultPrintMethod);
    let next: PrintMethodId = allowed[0];
    if (fromUrl && allowed.includes(fromUrl)) next = fromUrl;
    else if (def && allowed.includes(def)) next = def;
    setPrintMethod(next);
  }, [product, searchParams]);

  // ── Restore design state from sessionStorage after product loads ───────────
  useEffect(() => {
    if (!id || !product) return;
    try {
      const savedState = sessionStorage.getItem(`designer_state_${id}`);
      if (savedState) {
        const designState = JSON.parse(savedState);

        if (designState.elements && Array.isArray(designState.elements)) {
          setElements(designState.elements);
          const currentViewElements = designState.elements.filter(
            (el: CanvasElement) => !el.view || el.view === currentView,
          );
          const initialState: HistoryState = {
            elements: JSON.parse(JSON.stringify(currentViewElements)),
            view: currentView,
            timestamp: Date.now(),
          };
          setUndoStack([initialState]);
          setRedoStack([]);
        }
        if (designState.selectedColors && Array.isArray(designState.selectedColors))
          setSelectedColors(designState.selectedColors);
        if (designState.selectedSizes && Array.isArray(designState.selectedSizes))
          setSelectedSizes(designState.selectedSizes);
        if (designState.selectedSizesByColor && typeof designState.selectedSizesByColor === 'object')
          setSelectedSizesByColor(designState.selectedSizesByColor);
        if (designState.currentView && ['front', 'back', 'sleeves'].includes(designState.currentView))
          setCurrentView(designState.currentView as 'front' | 'back' | 'sleeves');
        if (designState.designUrlsByPlaceholder && typeof designState.designUrlsByPlaceholder === 'object')
          setDesignUrlsByPlaceholder(designState.designUrlsByPlaceholder);
        if (designState.placementsByView && typeof designState.placementsByView === 'object')
          setPlacementsByView(designState.placementsByView);
        if (designState.savedPreviewImages && typeof designState.savedPreviewImages === 'object')
          setSavedPreviewImages(designState.savedPreviewImages);
        if (designState.displacementSettings && typeof designState.displacementSettings === 'object')
          setDisplacementSettings(designState.displacementSettings);
        if (typeof designState.primaryColorHex === 'string' || designState.primaryColorHex === null)
          setPrimaryColorHex(designState.primaryColorHex);
        if (designState.printMethod) {
          const pm = normalizePrintMethodId(designState.printMethod);
          if (pm) setPrintMethod(pm);
        }
        if (designState.storeProductId) setStoreProductId(designState.storeProductId);

        restoredFromSessionRef.current = true;
        sessionStorage.removeItem(`designer_state_${id}`);
      } else {
        const initialState: HistoryState = { elements: [], view: currentView, timestamp: Date.now() };
        setUndoStack([initialState]);
        setRedoStack([]);
      }
    } catch (err) {
      console.error('Failed to restore design state:', err);
      const initialState: HistoryState = { elements: [], view: currentView, timestamp: Date.now() };
      setUndoStack([initialState]);
      setRedoStack([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, product]);

  // ── Load mockup when view changes ──────────────────────────────────────────
  useEffect(() => {
    if (!product?.design?.views) return;
    const existingMockup = mockupImagesByView[currentView];
    if (!existingMockup) {
      loadMockupForView(currentView, product.design.views);
    } else {
      const size = imageSizesByView[currentView];
      if (size && size.width > 0) setStageSize({ width: canvasWidth, height: canvasHeight });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, product?.design?.views]);

  // ── Auto-select first placeholder when view changes ────────────────────────
  useEffect(() => {
    if (product?.design?.views) {
      const view = product.design.views.find((v: ProductView) => v.key === currentView);
      if (view?.placeholders?.[0]) {
        setSelectedPlaceholderId(view.placeholders[0].id);
      }
    }
  }, [currentView, product]);

  // ── Reset color/size selections on product change (skip after session restore) ──
  useEffect(() => {
    if (restoredFromSessionRef.current) return;
    setSelectedColors([]);
    setSelectedSizes([]);
  }, [product?._id]);

  // ── Load designData.previews from storeProduct document ───────────────────
  useEffect(() => {
    if (!storeProductId) return;
    storeProductsApi.getById(storeProductId)
      .then(resp => {
        const previews = resp?.data?.designData?.previews;
        if (previews && typeof previews === 'object')
          setSavedMockupPreviews(previews as Record<string, string>);
        const pm = normalizePrintMethodId(resp?.data?.designData?.printMethod);
        if (pm) setPrintMethod(pm);
      })
      .catch(() => { });
  }, [storeProductId]);

  // ── Mark ALL views dirty when primary color changes ────────────────────────
  useEffect(() => {
    if (product?.design?.views) {
      const allViewKeys = product.design.views.map((v: ProductView) => v.key);
      setDirtyViewsForColor(new Set(allViewKeys));
      console.log('[DesignEditor] Global color changed:', {
        primaryColorHex, currentView, allViewKeys,
      });
    }
  }, [primaryColorHex, product?.design?.views]);

  // ── Derived / computed ─────────────────────────────────────────────────────
  const currentViewData = useMemo(() => {
    if (!product?.design?.views) return null;
    return product.design.views.find((v: ProductView) => v.key === currentView);
  }, [product, currentView]);

  const DEFAULT_PHYSICAL_WIDTH = 20;
  const DEFAULT_PHYSICAL_HEIGHT = 24;

  const PX_PER_INCH = useMemo(() => {
    const physicalWidth = product?.design?.physicalDimensions?.width ?? DEFAULT_PHYSICAL_WIDTH;
    const physicalHeight = product?.design?.physicalDimensions?.height ?? DEFAULT_PHYSICAL_HEIGHT;
    if (!physicalWidth || !physicalHeight || physicalWidth <= 0 || physicalHeight <= 0) {
      console.warn('Could not determine physical dimensions, using hardcoded fallback PX_PER_INCH');
      return 10;
    }
    const scaleX = effectiveCanvasWidth / physicalWidth;
    const scaleY = effectiveCanvasHeight / physicalHeight;
    const pxPerInch = Math.min(scaleX, scaleY);
    console.log('Calculated PX_PER_INCH (DesignEditor):', {
      physicalWidth, physicalHeight, effectiveCanvasWidth, effectiveCanvasHeight, scaleX, scaleY, pxPerInch,
    });
    return pxPerInch;
  }, [product?.design?.physicalDimensions, effectiveCanvasWidth, effectiveCanvasHeight]);

  const inchesToPixels = useCallback((inches: number): number => inches * PX_PER_INCH, [PX_PER_INCH]);

  const placeholders = useMemo(() => {
    const sourcePlaceholders = currentViewData?.placeholders || [];
    if (!sourcePlaceholders || sourcePlaceholders.length === 0) {
      console.log('No placeholders found for current view');
      return [];
    }

    const visualColors = ['#ec4899', '#8ce2f5', '#a3ffc6', '#f4fea9', '#ffe2db'];

    return sourcePlaceholders.map((placeholder: Placeholder, index: number) => {
      const visualColor = visualColors[index % visualColors.length];
      const scale = placeholder.scale ?? 1.0;
      const isPolygon =
        placeholder.shapeType === 'polygon' &&
        placeholder.polygonPoints &&
        placeholder.polygonPoints.length >= 3;

      const xPx = canvasPadding + inchesToPixels(placeholder.xIn);
      const yPx = canvasPadding + inchesToPixels(placeholder.yIn);
      const widthPx = inchesToPixels(placeholder.widthIn) * scale;
      const heightPx = inchesToPixels(placeholder.heightIn) * scale;

      const polygonPointsPx = isPolygon
        ? placeholder.polygonPoints!.map(pt => [
            canvasPadding + inchesToPixels(pt.xIn) * scale,
            canvasPadding + inchesToPixels(pt.yIn) * scale,
          ]).flat()
        : undefined;

      return {
        id: placeholder.id,
        x: xPx,
        y: yPx,
        width: widthPx,
        height: heightPx,
        rotation: placeholder.rotationDeg || 0,
        scale,
        lockSize: placeholder.lockSize || false,
        original: { ...placeholder, color: visualColor },
        isPolygon,
        polygonPointsPx,
      };
    });
  }, [currentViewData, PX_PER_INCH, inchesToPixels, canvasPadding]);

  const variantValidation = useMemo(() => {
    if (selectedColors.length === 0)
      return { isValid: false, message: 'Please select at least one color variant' };
    const hasAnySize = selectedColors.some(color => {
      const sizes = selectedSizesByColor[color] || selectedSizes;
      return sizes.length > 0;
    });
    if (!hasAnySize)
      return { isValid: false, message: 'Please select at least one size variant' };
    return { isValid: true };
  }, [selectedColors, selectedSizes, selectedSizesByColor]);

  const catalogAllowedPrintMethods = useMemo((): PrintMethodId[] => {
    if (!product?.catalogue) return [DEFAULT_PRINT_METHOD];
    const cat = product.catalogue as { categoryId?: string; availablePrintMethods?: unknown };
    const raw = cat.availablePrintMethods;
    if (Array.isArray(raw) && raw.length > 0) {
      const ids = raw.map((x) => normalizePrintMethodId(x)).filter(Boolean) as PrintMethodId[];
      if (ids.length) return ids;
    }
    if (cat.categoryId === 'apparel') return ['DTG', 'DTF', 'EMBROIDERY'];
    return [DEFAULT_PRINT_METHOD];
  }, [product]);

  const availableViews = useMemo(() => {
    if (!product?.design?.views) return [];
    return product.design.views.map((v: ProductView) => v.key);
  }, [product]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDisplacementSettingsChange = useCallback(
    (settings: DisplacementSettings) => {
      setDisplacementSettings(settings);
      setHasUnsavedChanges(true);
      registerEditActivity();
      setDirtyViewsForDesign(prev => new Set([...prev, currentView]));
    },
    [currentView, registerEditActivity, setHasUnsavedChanges],
  );

  const handleColorToggle = useCallback(
    (color: string) => {
      setSelectedColors(prev => {
        if (prev.includes(color)) {
          setSelectedSizesByColor(prevSizes => {
            const newSizes = { ...prevSizes };
            delete newSizes[color];
            return newSizes;
          });
          return prev.filter(c => c !== color);
        }
        const withoutColor = prev.filter(c => c !== color);
        return [color, ...withoutColor];
      });
      setHasUnsavedChanges(true);
    },
    [setHasUnsavedChanges],
  );

  const handleSizeToggle = useCallback((size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size],
    );
  }, []);

  const handleSizeToggleForColor = useCallback((color: string, size: string) => {
    setSelectedSizesByColor(prev => {
      const colorSizes = prev[color] || [];
      const updatedSizes = colorSizes.includes(size)
        ? colorSizes.filter(s => s !== size)
        : [...colorSizes, size];
      return { ...prev, [color]: updatedSizes };
    });
  }, []);

  const fetchUserPreviews = useCallback(async () => {
    try {
      if (!id) return;
      const resp = await fetchWithApiAuth(`/auth/me/previews/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        credentials: 'include',
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.ok && json?.success) {
        setSavedPreviewImages((json.data || {}) as Record<string, string>);
      }
    } catch (e) {
      console.error('Failed to fetch user preview images:', e);
    }
  }, [id]);

  // ── Design URL helpers ─────────────────────────────────────────────────────
  const getDesignUrlsForView = useCallback(
    (view: string): Record<string, string> => designUrlsByPlaceholder[view] || {},
    [designUrlsByPlaceholder],
  );

  const getDesignUrlsHash = useCallback(
    (view: string): string => {
      const urls = getDesignUrlsForView(view);
      const keys = Object.keys(urls).sort();
      if (keys.length === 0) return 'no-designs';
      return keys.map(k => `${k.slice(0, 4)}-${urls[k]?.slice(-10) || ''}`).join('_');
    },
    [getDesignUrlsForView],
  );

  const setDesignUrlForView = useCallback(
    (view: string, placeholderId: string, designUrl: string) => {
      setDesignUrlsByPlaceholder(prev => ({
        ...prev,
        [view]: { ...(prev[view] || {}), [placeholderId]: designUrl },
      }));
      setHasUnsavedChanges(true);
      registerEditActivity();
      setDirtyViewsForDesign(prev => new Set([...prev, view]));
      console.log('Design changed for view, marking dirty:', view);
    },
    [registerEditActivity, setHasUnsavedChanges],
  );

  const removeDesignUrlForView = useCallback(
    (view: string, placeholderId: string) => {
      setDesignUrlsByPlaceholder(prev => {
        const viewDesigns = { ...(prev[view] || {}) };
        delete viewDesigns[placeholderId];
        return { ...prev, [view]: viewDesigns };
      });
      setPlacementsByView(prev => {
        const viewPlacements = { ...(prev[view] || {}) };
        delete viewPlacements[placeholderId];
        return { ...prev, [view]: viewPlacements };
      });
      setHasUnsavedChanges(true);
      registerEditActivity();
    },
    [registerEditActivity, setHasUnsavedChanges],
  );

  // ── Placement helpers ──────────────────────────────────────────────────────
  const getPlacementsForView = useCallback(
    (view: string): Record<string, DesignPlacement> => placementsByView[view] || {},
    [placementsByView],
  );

  const setPlacementForView = useCallback(
    (view: string, placeholderId: string, placement: DesignPlacement) => {
      setPlacementsByView(prev => ({
        ...prev,
        [view]: { ...(prev[view] || {}), [placeholderId]: placement },
      }));
      setHasUnsavedChanges(true);
      registerEditActivity();
    },
    [registerEditActivity, setHasUnsavedChanges],
  );

  const computePlacementFromElement = useCallback(
    (
      element: CanvasElement,
      viewPlaceholders: Array<{ id: string; x: number; y: number; width: number; height: number }>,
    ): DesignPlacement | null => {
      if (!element.placeholderId || !element.width || !element.height) return null;
      const placeholder = viewPlaceholders.find(p => p.id === element.placeholderId);
      if (!placeholder) return null;
      const printArea: PrintAreaPixels = {
        x: placeholder.x, y: placeholder.y, w: placeholder.width, h: placeholder.height,
      };
      const designBounds = {
        x: element.x, y: element.y,
        width: element.width, height: element.height,
        rotation: element.rotation || 0,
      };
      const viewKey = (element.view || currentView) as ViewKey;
      return pixelsToNormalized(designBounds, printArea, viewKey, element.placeholderId);
    },
    [currentView],
  );

  const getPreviewCacheKey = useCallback(
    (viewKey: string, elements: CanvasElement[]): string => {
      const colorKey = primaryColorHex || 'no-color';
      const designSig = getDesignUrlsHash(viewKey);
      const viewElements = elements.filter(el => el.view === viewKey || !el.view);
      const elementsSig =
        viewElements.length > 0
          ? viewElements.map(el => `${el.id}-${el.type}-${el.imageUrl?.slice(-10) || ''}`).join('|')
          : 'no-elements';
      return `${viewKey}|${colorKey}|${designSig}|${elementsSig}`;
    },
    [primaryColorHex, getDesignUrlsHash],
  );

  // ── Convenience aliases ────────────────────────────────────────────────────
  const mockupImage = mockupImagesByView[currentView] ?? null;
  const imageSize = imageSizesByView[currentView] ?? { width: 0, height: 0, x: 0, y: 0 };

  return {
    // Product
    product, setProduct,
    isLoadingProduct,

    // View
    currentView, setCurrentView,
    currentViewData,
    availableViews,

    // Mockup
    mockupImage,
    imageSize,
    mockupImagesByView,
    imageSizesByView,
    loadMockupForView,

    // Placeholder selection
    selectedPlaceholderId, setSelectedPlaceholderId,
    selectedPlaceholderIdRef,

    // Variants
    selectedColors, setSelectedColors,
    selectedSizes, setSelectedSizes,
    selectedSizesByColor, setSelectedSizesByColor,
    primaryColorHex, setPrimaryColorHex,
    variantValidation,
    handleColorToggle,
    handleSizeToggle,
    handleSizeToggleForColor,

    // Print method
    printMethod, setPrintMethod,
    catalogAllowedPrintMethods,

    // Store product / publishing
    storeProductId, setStoreProductId,
    isPublishing, setIsPublishing,

    // Displacement
    displacementSettings, setDisplacementSettings,
    handleDisplacementSettingsChange,

    // Previews
    savedPreviewImages, setSavedPreviewImages,
    savedMockupPreviews, setSavedMockupPreviews,
    previewCache, setPreviewCache,
    fetchUserPreviews,

    // Dirty flags
    dirtyViewsForColor, setDirtyViewsForColor,
    dirtyViewsForDesign, setDirtyViewsForDesign,

    // Design URLs
    designUrlsByPlaceholder, setDesignUrlsByPlaceholder,
    getDesignUrlsForView,
    getDesignUrlsHash,
    setDesignUrlForView,
    removeDesignUrlForView,

    // Placements
    placementsByView, setPlacementsByView,
    getPlacementsForView,
    setPlacementForView,
    computePlacementFromElement,
    getPreviewCacheKey,

    // Physics / placeholders
    placeholders,
    PX_PER_INCH,
    inchesToPixels,

    // Session
    restoredFromSessionRef,
  };
};
