import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Stage, Layer, Text, TextPath, Image, Rect, Group, Transformer, Line, Shape, Circle, RegularPolygon, Star } from 'react-konva';
import Konva from 'konva';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Upload, Type, Image as ImageIcon, Folder, Sparkles, BotIcon, Undo2, Redo2,
  ZoomIn, ZoomOut, Move, Copy, Trash2, X, Plus, Package, Menu, Save, Layers, Eye, EyeOff,
  Lock, Unlock, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, Palette, Grid, Ruler, Download, Settings, Settings2, ChevronRight,
  ChevronLeft, Maximize2, Minimize2, RotateCw, Square, Circle as CircleIcon, Triangle, Sparkles as SparklesIcon, Wand2,
  Heart, Star as StarIcon, ArrowRight, Search, Filter, SortAsc, FolderOpen, ArrowLeft, ArrowUp, ArrowDown, Pen, Camera, Layout, Hand, Eraser, GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { productApi, storeApi, storeProductsApi } from '@/lib/api';
import { ProductInfoPanel } from '@/components/designer/ProductsInfoPanel';
// import { DpiWarningPanel } from '@/components/designer/DpiWarningPanel';
import { DpiIndicator } from '@/components/designer/DpiIndicator';
import { calculateEffectiveDpi } from '@/types/editor';
import { useDpiCalculation } from '@/hooks/useDpiCalculation';
import { useCanvasElements } from '@/hooks/useCanvasElements';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import type { DisplacementSettings, DesignPlacement, NormalizedPosition, ViewKey } from '@/types/product';
// import {
//   DEFAULT_PRINT_METHOD,
//   normalizePrintMethodId,
//   PRINT_METHOD_DEFINITIONS,
//   type PrintMethodId,
// } from '@/config/printMethods';
import type { CanvasElement, HistoryState, Placeholder, ProductView, Product } from '@/types/editor';
import { API_BASE_URL, RAW_API_URL } from '@/config';
import { fetchWithApiAuth } from '@/lib/api';
import { isEmbeddedShopifyApp } from '@/lib/shopifyFetch';
import { pixelsToNormalized, createDefaultPlacement, type PrintAreaPixels } from '@/lib/placementUtils';
import { generateDefaultStoreData } from '@/utils/storeNameGenerator';

// ── Extracted sub-modules ─────────────────────────────────────────────────────
import { wrapTextLinesForCanvasExport, getTextWidth } from './engine/textUtils';
import { calculateRotatedBounds } from './engine/transformEngine';
import { _imageCache, _tintCache, getCachedImage, tintGarmentImage } from './engine/imageUtils';
import { useImageLoader } from './components/Canvas/elements/useImageLoader';
import { ImageElement } from './components/Canvas/elements/ImageElement';
import { TextElement } from './components/Canvas/elements/TextElement';
import { ShapeElement } from './components/Canvas/elements/ShapeElement';
import { PositionInput } from './components/ui/PositionInput';
import { AlignTopIcon, AlignMiddleIcon, AlignBottomIcon } from './components/ui/AlignIcons';
import { PropertiesPanel } from './components/Panels/PropertiesPanel';
import { LayersPanel } from './components/Panels/LayersPanel';

const UploadPanel = lazy(() => import('@/components/designer/panels/UploadPanel').then(m => ({ default: m.UploadPanel })));
const TextPanel = lazy(() => import('@/components/designer/panels/TextPanel'));
const ShapesPanel = lazy(() => import('@/components/designer/panels/ShapesPanel').then(m => ({ default: m.ShapesPanel })));
const GraphicsPanel = lazy(() => import('@/components/designer/panels/GraphicsPanel').then(m => ({ default: m.GraphicsPanel })));
const LibraryPanel = lazy(() => import('@/components/designer/panels/LibraryPanel').then(m => ({ default: m.LibraryPanel })));
const LogosPanel = lazy(() => import('@/components/designer/panels/LogosPanel').then(m => ({ default: m.LogosPanel })));
const AssetPanel = lazy(() => import('@/components/designer/panels/AssetPanel').then(m => ({ default: m.AssetPanel })));
const TemplatesPanel = lazy(() => import('@/components/designer/panels/TemplatesPanel').then(m => ({ default: m.TemplatesPanel })));
const AIimageGen = lazy(() => import('@/components/designer/AIimageGen'));

const PanelFallback = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
  </div>
);

const DesignEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshStores, selectStoreById } = useStore();

  // Canvas state
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  // Track whether we've restored design state from sessionStorage
  const restoredFromSessionRef = useRef(false);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 1000 });

  // Keyboard shortcut for escaping selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIds([]);
        setSelectedPlaceholderId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tool state
  const [activeTool, setActiveTool] = useState<'upload' | 'text' | 'shapes' | 'graphics' | 'patterns' | 'logos' | 'library' | 'templates' | 'select' | 'move' | 'crop' | 'erase' | 'ai'>('select');
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number; active: boolean } | null>(null);
  const selectionStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialSelectedIdsRef = useRef<string[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showRightPanel, setShowRightPanel] = useState(window.innerWidth >= 1024);
  const [showLeftPanel, setShowLeftPanel] = useState(window.innerWidth >= 1024);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<{ url: string; name: string }[]>([]);
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<string>('product');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileToolStage, setMobileToolStage] = useState<'none' | 'menu' | 'detail'>('none');
  const [storeProductId, setStoreProductId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  // const [ setPrintMethod] = useState<PrintMethodId>(DEFAULT_PRINT_METHOD);

  const [bgRemovingId, setBgRemovingId] = useState<string | null>(null);

  // DPI validation: elementId → effectiveDPI for all images below 300 DPI
  const [lowDpiImages, setLowDpiImages] = useState<Record<string, number>>({});
  // Live DPI result for the currently selected image
  const [selectedDpiResult, setSelectedDpiResult] = useState<any | null>(null);

  // Hook for accurate DPI calculations
  const { calculateDpi } = useDpiCalculation();

  const handleBgRemoverAction = () => {
    const selectedElement = elements.find(el => selectedIds.includes(el.id));
    if (!selectedElement || selectedElement.type !== 'image') {
      toast.error("Please click an image on the canvas to select it first.");
      return;
    }
    handleRemoveBackground(selectedElement);
  };

  const handleRemoveBackground = async (element: CanvasElement) => {
    if (!element.imageUrl || bgRemovingId) return;

    setBgRemovingId(element.id);
    const toastId = toast.loading("Removing background... This may take a moment the first time.");

    try {
      // Use imgly's in-browser AI model to remove background
      const imageBlob = await imglyRemoveBackground(element.imageUrl);
      const newImageUrl = URL.createObjectURL(imageBlob);

      setElements(prev => prev.map(el => el.id === element.id ? { ...el, imageUrl: newImageUrl } : el));
      toast.success("Background removed successfully!", { id: toastId });
      setHasUnsavedChanges(true);
    } catch (err: any) {
      console.error("Background removal error:", err);
      toast.error(err.message || "Failed to remove background", { id: toastId });
    } finally {
      setBgRemovingId(null);
    }
  };

  // Track if selection is from adding an asset (to prevent auto-opening properties on mobile)
  const isAddingAssetRef = useRef(false);

  // Handle window resize for isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
        setMobileToolStage('none');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mobile layer selection -> NO AUTO-OPEN as per user request
  useEffect(() => {
    if (isMobile && selectedIds.length > 0) {
      // Reset the flag after handling - we no longer auto-open properties
      isAddingAssetRef.current = false;
    }
  }, [selectedIds, isMobile]);

  // Touch gesture state for mobile pan/zoom
  const touchStateRef = useRef({
    distance: 0,
    lastPos: { x: 0, y: 0 },
    isPinching: false,
    isPanning: false
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;

    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.sqrt(Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2));

      touchStateRef.current = {
        ...touchStateRef.current,
        distance: dist,
        isPinching: true,
        isPanning: false
      };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];

      if (activeTool === 'move') {
        touchStateRef.current = {
          ...touchStateRef.current,
          lastPos: { x: t.clientX, y: t.clientY },
          isPinching: false,
          isPanning: true
        };
      } else {
        // Selection box start will be handled on Stage for better coordinate precision
        touchStateRef.current = {
          ...touchStateRef.current,
          isPinching: false,
          isPanning: false
        };
      }
    }
  }, [isMobile, activeTool]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;

    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.sqrt(Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2));

      const scaleChange = dist / touchStateRef.current.distance;
      if (Math.abs(scaleChange - 1) > 0.01) {
        setZoom(prev => Math.min(500, Math.max(10, prev * scaleChange)));
        touchStateRef.current.distance = dist;
      }
    } else if (e.touches.length === 1 && touchStateRef.current.isPanning && activeTool === 'move') {
      const t = e.touches[0];
      const dx = t.clientX - touchStateRef.current.lastPos.x;
      const dy = t.clientY - touchStateRef.current.lastPos.y;

      setStagePos(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));

      touchStateRef.current.lastPos = { x: t.clientX, y: t.clientY };
    }
  }, [isMobile, zoom, activeTool]);

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.isPinching = false;
    touchStateRef.current.isPanning = false;
  }, []);

  // Use ref to track selected placeholder for callback
  const selectedPlaceholderIdRef = useRef<string | null>(null);

  // Update ref when state changes
  useEffect(() => {
    selectedPlaceholderIdRef.current = selectedPlaceholderId;
    console.log('selectedPlaceholderId updated:', selectedPlaceholderId);
  }, [selectedPlaceholderId]);

  // History - proper undo/redo stack pattern
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  const maxHistory = 50;
  const historySaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringHistoryRef = useRef(false); // Prevent saving history while restoring

  // View state
  const [currentView, setCurrentView] = useState<'front' | 'back' | 'sleeves'>('front');
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // true = hide overlay/panels, show only mockup + design
  const [isPreviewTemporarilyDisabled, setIsPreviewTemporarilyDisabled] = useState(false);
  const [primaryColorHex, setPrimaryColorHex] = useState<string | null>(null);
  const previewModeRef = useRef(false); // Ref to ensure previewMode persists across view changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track if there are unsaved changes
  const editActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // True while a multi-view mockup capture is in progress — suppresses UI chrome in the canvas
  const [isCapturingMockup, setIsCapturingMockup] = useState(false);
  // Ref-gate so concurrent auto-save and manual-save runs never overlap
  const isSavingMockupsRef = useRef(false);

  // Debounced edit-activity tracker to gate Preview tab while edits are in-flight
  const registerEditActivity = useCallback(() => {
    setIsPreviewTemporarilyDisabled(true);
    if (editActivityTimeoutRef.current) {
      clearTimeout(editActivityTimeoutRef.current);
    }
    editActivityTimeoutRef.current = setTimeout(() => {
      setIsPreviewTemporarilyDisabled(false);
    }, 800);
  }, []);

  // Sync ref with state
  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);

  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (editActivityTimeoutRef.current) {
        clearTimeout(editActivityTimeoutRef.current);
      }
    };
  }, []);

  const fetchUserPreviews = useCallback(async () => {
    try {
      if (!id) return;
      const resp = await fetchWithApiAuth(`/auth/me/previews/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.ok && json?.success) {
        const previews = (json.data || {}) as Record<string, string>;
        setSavedPreviewImages(previews);
      }
    } catch (e) {
      console.error('Failed to fetch user preview images:', e);
    }
  }, [id]);

  // Design URLs by placeholder ID - stored per view
  const [designUrlsByPlaceholder, setDesignUrlsByPlaceholder] = useState<Record<string, Record<string, string>>>({});

  // Design placements by placeholder ID - stores normalized (0-1) positions within print areas
  // Structure: { viewKey: { placeholderId: DesignPlacement } }
  const [placementsByView, setPlacementsByView] = useState<Record<string, Record<string, DesignPlacement>>>({});

  // Helper functions for view-specific designUrlsByPlaceholder
  const getDesignUrlsForView = useCallback((view: string): Record<string, string> => {
    return designUrlsByPlaceholder[view] || {};
  }, [designUrlsByPlaceholder]);

  // Helper to create a simple hash of design URLs for key generation
  const getDesignUrlsHash = useCallback((view: string): string => {
    const urls = getDesignUrlsForView(view);
    const keys = Object.keys(urls).sort();
    if (keys.length === 0) return 'no-designs';
    // Create a simple hash from placeholder IDs and URL lengths
    return keys.map(k => `${k.slice(0, 4)}-${urls[k]?.slice(-10) || ''}`).join('_');
  }, [getDesignUrlsForView]);

  const setDesignUrlForView = useCallback((view: string, placeholderId: string, designUrl: string) => {
    setDesignUrlsByPlaceholder(prev => ({
      ...prev,
      [view]: {
        ...(prev[view] || {}),
        [placeholderId]: designUrl,
      },
    }));
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    registerEditActivity();
    // Mark this specific view as dirty for design changes
    setDirtyViewsForDesign(prev => new Set([...prev, view]));
    console.log('Design changed for view, marking dirty:', view);
  }, [registerEditActivity]);

  const removeDesignUrlForView = useCallback((view: string, placeholderId: string) => {
    setDesignUrlsByPlaceholder(prev => {
      const viewDesigns = prev[view] || {};
      const updated = { ...viewDesigns };
      delete updated[placeholderId];
      return {
        ...prev,
        [view]: updated,
      };
    });
    // Also remove placement
    setPlacementsByView(prev => {
      const viewPlacements = prev[view] || {};
      const updated = { ...viewPlacements };
      delete updated[placeholderId];
      return {
        ...prev,
        [view]: updated,
      };
    });
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    registerEditActivity();
  }, [registerEditActivity]);

  // Get placements for a specific view
  const getPlacementsForView = useCallback((view: string): Record<string, DesignPlacement> => {
    return placementsByView[view] || {};
  }, [placementsByView]);

  // Set placement for a specific placeholder in a view
  const setPlacementForView = useCallback((view: string, placeholderId: string, placement: DesignPlacement) => {
    setPlacementsByView(prev => ({
      ...prev,
      [view]: {
        ...(prev[view] || {}),
        [placeholderId]: placement,
      },
    }));
    setHasUnsavedChanges(true);
    registerEditActivity();
  }, [registerEditActivity]);

  const handleTextDblClick = useCallback((id: string) => {
    setEditingTextId(id);
  }, []);

  // Compute normalized placement from an element's pixel coordinates
  // This is called whenever an image element is added or transformed


  const computePlacementFromElement = useCallback((
    element: CanvasElement,
    viewPlaceholders: Array<{ id: string; x: number; y: number; width: number; height: number }>
  ): DesignPlacement | null => {
    if (!element.placeholderId || !element.width || !element.height) {
      return null;
    }

    const placeholder = viewPlaceholders.find(p => p.id === element.placeholderId);
    if (!placeholder) {
      return null;
    }

    // Print area in pixels
    const printArea: PrintAreaPixels = {
      x: placeholder.x,
      y: placeholder.y,
      w: placeholder.width,
      h: placeholder.height,
    };

    // Element bounds in pixels
    const designBounds = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation || 0,
    };

    // Convert to normalized placement
    const viewKey = (element.view || currentView) as ViewKey;
    return pixelsToNormalized(designBounds, printArea, viewKey, element.placeholderId);
  }, [currentView]);

  // Product state
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  // Store mockup images per view to prevent losing previous mockups when switching
  const [mockupImagesByView, setMockupImagesByView] = useState<Record<string, HTMLImageElement | null>>({});
  const [imageSizesByView, setImageSizesByView] = useState<Record<string, { width: number; height: number; x: number; y: number }>>({});


  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]); // Keep for backward compatibility
  const [selectedPrintMethodsByView, setSelectedPrintMethodsByView] = useState<Record<string, string | null>>({});
  const [selectedSizesByColor, setSelectedSizesByColor] = useState<Record<string, string[]>>({});
  // Current view's mockup — always the base product image (view.mockupImageUrl)
  const _primaryColorNorm = (selectedColors[0] || '').toLowerCase().trim();
  const _mockupCacheKey = currentView; // cache keyed by view only
  const mockupImage = mockupImagesByView[currentView] ?? null;
  const imageSize = imageSizesByView[currentView] ?? { width: 0, height: 0, x: 0, y: 0 };
  const [isPublishing, setIsPublishing] = useState(false);
  const [displacementSettings, setDisplacementSettings] = useState<DisplacementSettings>({
    scaleX: 20,
    scaleY: 20,
    contrastBoost: 1.5,
  });
  const [savedPreviewImages, setSavedPreviewImages] = useState<Record<string, string>>({});
  // Composed mockup previews: garment + design, keyed by viewKey
  const [savedMockupPreviews, setSavedMockupPreviews] = useState<Record<string, string>>({});

  // Preview cache with proper keying: viewKey|garmentTintHex|designSig|settingsSig
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});

  // Dirty flags: track which views need regeneration
  const [dirtyViewsForColor, setDirtyViewsForColor] = useState<Set<string>>(new Set());
  const [dirtyViewsForDesign, setDirtyViewsForDesign] = useState<Set<string>>(new Set());

  // --- VARIANT VALIDATION ---
  const variantValidation = useMemo(() => {
    if (selectedColors.length === 0) {
      return { isValid: false, message: 'Please select at least one color variant' };
    }

    // Check if any sizes are selected across all selected colors
    // Use the same logic as handlePublishToStore for size resolution
    const hasAnySize = selectedColors.some(color => {
      const sizes = selectedSizesByColor[color] || selectedSizes;
      return sizes.length > 0;
    });

    if (!hasAnySize) {
      return { isValid: false, message: 'Please select at least one size variant' };
    }

    return { isValid: true };
  }, [selectedColors, selectedSizes, selectedSizesByColor]);

  // --- PRINT METHOD VALIDATION ---
  const printMethodValidation = useMemo(() => {
    const activeMethods = ((product?.allowedPrintMethodIds as any[]) ?? []).filter((method: any) => {
      if (!method || typeof method === 'string') return true;
      return method.active !== false;
    });
    if (activeMethods.length <= 1) return { isValid: true };
    const hasSelection = Object.values(selectedPrintMethodsByView).some(id => id != null);
    if (!hasSelection) return { isValid: false, message: 'Please select a print method for at least one side' };
    return { isValid: true };
  }, [product?.allowedPrintMethodIds, selectedPrintMethodsByView]);

  // Generate cache key: viewKey|garmentTintHex|designSig|settingsSig
  const getPreviewCacheKey = useCallback((viewKey: string): string => {
    const colorKey = primaryColorHex || 'no-color';
    const designSig = getDesignUrlsHash(viewKey);
    const viewElements = elements.filter(el => el.view === viewKey || !el.view);
    const elementsSig = viewElements.length > 0
      ? viewElements.map(el => `${el.id}-${el.type}-${el.imageUrl?.slice(-10) || ''}`).join('|')
      : 'no-elements';
    const combinedDesignSig = `${designSig}|${elementsSig}`;
    return `${viewKey}|${colorKey}|${combinedDesignSig}`;
  }, [primaryColorHex, getDesignUrlsHash, elements]);

  // Wrapper for displacement settings that marks unsaved changes
  const handleDisplacementSettingsChange = useCallback((settings: DisplacementSettings) => {
    setDisplacementSettings(settings);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    registerEditActivity();
    // Mark current view as dirty for design changes (settings affect preview)
    setDirtyViewsForDesign(prev => new Set([...prev, currentView]));
  }, [currentView, registerEditActivity]);

  // Handle global color change - mark ALL views dirty
  useEffect(() => {
    if (product?.design?.views) {
      const allViewKeys = product.design.views.map((v: ProductView) => v.key);
      setDirtyViewsForColor(new Set(allViewKeys));
      console.log('[DesignEditor] Global color changed:', {
        primaryColorHex,
        currentView,
        allViewKeys,
        elementsCount: elements.length,
        elementsByView: {
          front: elements.filter(e => e.view === 'front' || !e.view).length,
          back: elements.filter(e => e.view === 'back').length,
        },
        designUrlsByPlaceholder: Object.keys(designUrlsByPlaceholder).reduce((acc, view) => {
          acc[view] = Object.keys(designUrlsByPlaceholder[view] || {}).length;
          return acc;
        }, {} as Record<string, number>),
      });
    }
  }, [primaryColorHex, product?.design?.views]);



  const tools = [
    {
      icon: BotIcon,
      label: 'AI Image Gen',
      toolKey: 'ai' as const,
      onClick: () => {
        setActiveTool('ai');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Upload,
      label: 'Upload',
      toolKey: 'upload' as const,
      onClick: () => {
        setActiveTool('upload');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Type,
      label: 'Text',
      toolKey: 'text' as const,
      onClick: () => {
        setActiveTool('text');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Sparkles,
      label: 'Shapes',
      toolKey: 'shapes' as const,
      onClick: () => {
        setActiveTool('shapes');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Palette,
      label: 'Graphics',
      toolKey: 'graphics' as const,
      onClick: () => {
        setActiveTool('graphics');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Wand2,
      label: 'Patterns',
      toolKey: 'patterns' as const,
      onClick: () => {
        setActiveTool('patterns');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: ImageIcon,
      label: 'Logos',
      toolKey: 'logos' as const,
      onClick: () => {
        setActiveTool('logos');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Folder,
      label: 'Library',
      toolKey: 'library' as const,
      onClick: () => {
        setActiveTool('library');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },
    {
      icon: Layout,
      label: 'Templates',
      toolKey: 'templates' as const,
      onClick: () => {
        setActiveTool('templates');
        setShowLeftPanel(true);
        if (isMobile) setMobileToolStage('detail');
      }
    },

  ];

  // Canvas dimensions - fixed size like admin
  const canvasWidth = 800;
  const canvasHeight = 600;
  const canvasPadding = 40;
  const effectiveCanvasWidth = canvasWidth - (canvasPadding * 2);
  const effectiveCanvasHeight = canvasHeight - (canvasPadding * 2);

  // Ensure Stage is sized immediately so Konva placeholder outlines appear instantly
  useEffect(() => {
    setStageSize({ width: canvasWidth, height: canvasHeight });
  }, [canvasWidth, canvasHeight]);

  // Function to load the base product mockup for a specific view.
  // Always uses view.mockupImageUrl — the clean studio/base product image.
  // sampleMockups (lifestyle photos) are for mockup generation only, NOT the canvas background.
  // Color changes are handled visually by tintGarmentImage() at render time.
  const loadMockupForView = useCallback((viewKey: string, views: ProductView[]) => {
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
      .then((img) => {
        // Evict any stale tint-cache entries that were built from a previously
        // tainted (non-blob) copy of this image so they are re-drawn cleanly.
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
  }, [effectiveCanvasWidth, effectiveCanvasHeight, canvasPadding, canvasWidth, canvasHeight, mockupImagesByView]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setIsLoadingProduct(false);
        return;
      }

      try {
        setIsLoadingProduct(true);
        const response = await productApi.getById(id);
        if (response && response.data) {
          console.log('Fetched product data:', {
            product: response.data,
            design: response.data.design,
            views: response.data.design?.views,
            physicalDimensions: response.data.design?.physicalDimensions
          });

          setProduct(response.data);
          const previews = (response.data.design as any)?.previewImages || {};
          if (previews && typeof previews === 'object') {
            setSavedPreviewImages(previews);
          }

          // Load mockup images for all views (current view immediately, others in background)
          if (response.data.design?.views) {
            loadMockupForView(currentView, response.data.design.views);
            response.data.design.views.forEach((v: ProductView) => {
              if (v.key !== currentView && v.mockupImageUrl) {
                getCachedImage(v.mockupImageUrl).catch(() => { });
              }
            });
          }

          // Initialize displacement settings from product design (if present)
          if (response.data.design?.displacementSettings) {
            setDisplacementSettings(response.data.design.displacementSettings);
          }

          // Reset unsaved changes flag when product is loaded (no changes yet)
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
  }, [id, canvasWidth, canvasHeight, effectiveCanvasWidth, effectiveCanvasHeight, canvasPadding, loadMockupForView]);

  // useEffect(() => {
  //   if (!product?.catalogue) return;
  //   const cat = product.catalogue as {
  //     categoryId?: string;
  //     availablePrintMethods?: unknown;
  //     defaultPrintMethod?: unknown;
  //   };
  //   const raw = cat.availablePrintMethods;
  //   let allowed: PrintMethodId[] = [DEFAULT_PRINT_METHOD];
  //   if (Array.isArray(raw) && raw.length > 0) {
  //     const ids = raw.map((x) => normalizePrintMethodId(x)).filter(Boolean) as PrintMethodId[];
  //     if (ids.length) allowed = ids;
  //   } else if (cat.categoryId === 'apparel') {
  //     allowed = ['DTG', 'DTF', 'EMBROIDERY'];
  //   }
  //   const fromUrl = normalizePrintMethodId(searchParams.get('printMethod'));
  //   const def = normalizePrintMethodId(cat.defaultPrintMethod);
  //   let next: PrintMethodId = allowed[0];
  //   if (fromUrl && allowed.includes(fromUrl)) next = fromUrl;
  //   else if (def && allowed.includes(def)) next = def;
  //   setPrintMethod(next);
  // }, [product, searchParams]);

  // Restore design state from sessionStorage after product loads
  useEffect(() => {
    if (!id || !product) return;

    try {
      const savedState = sessionStorage.getItem(`designer_state_${id}`);
      if (savedState) {
        const designState = JSON.parse(savedState);
        if (designState.elements && Array.isArray(designState.elements)) {
          setElements(designState.elements);
          // Initialize history with restored elements (filter by current view)
          const currentViewElements = designState.elements.filter((el: CanvasElement) => !el.view || el.view === currentView);
          const initialState: HistoryState = {
            elements: JSON.parse(JSON.stringify(currentViewElements)),
            view: currentView,
            timestamp: Date.now()
          };
          setUndoStack([initialState]);
          setRedoStack([]);
        }
        if (designState.selectedColors && Array.isArray(designState.selectedColors)) {
          setSelectedColors(designState.selectedColors);
        }
        if (designState.selectedSizes && Array.isArray(designState.selectedSizes)) {
          setSelectedSizes(designState.selectedSizes);
        }
        if (designState.selectedSizesByColor && typeof designState.selectedSizesByColor === 'object') {
          setSelectedSizesByColor(designState.selectedSizesByColor);
        }
        if (designState.selectedPrintMethodsByView && typeof designState.selectedPrintMethodsByView === 'object') {
          setSelectedPrintMethodsByView(designState.selectedPrintMethodsByView);
        }
        if (designState.currentView && ['front', 'back', 'sleeves'].includes(designState.currentView)) {
          setCurrentView(designState.currentView);
        }
        if (designState.designUrlsByPlaceholder && typeof designState.designUrlsByPlaceholder === 'object') {
          setDesignUrlsByPlaceholder(designState.designUrlsByPlaceholder);
        }
        if (designState.placementsByView && typeof designState.placementsByView === 'object') {
          setPlacementsByView(designState.placementsByView);
        }
        if (designState.savedPreviewImages && typeof designState.savedPreviewImages === 'object') {
          setSavedPreviewImages(designState.savedPreviewImages);
        }
        if (designState.displacementSettings && typeof designState.displacementSettings === 'object') {
          setDisplacementSettings(designState.displacementSettings);
        }
        if (typeof designState.primaryColorHex === 'string' || designState.primaryColorHex === null) {
          setPrimaryColorHex(designState.primaryColorHex);
        }
        if (designState.storeProductId) {
          setStoreProductId(designState.storeProductId);
        }
        // Mark that we restored from session so other effects don't wipe selections
        restoredFromSessionRef.current = true;
        // Clear the saved state after restoring
        sessionStorage.removeItem(`designer_state_${id}`);
      } else {
        // Initialize history with empty elements if no saved state
        const initialState: HistoryState = {
          elements: [],
          view: currentView,
          timestamp: Date.now()
        };
        setUndoStack([initialState]);
        setRedoStack([]);
      }
    } catch (err) {
      console.error('Failed to restore design state:', err);
      // Initialize history even on error
      const initialState: HistoryState = {
        elements: [],
        view: currentView,
        timestamp: Date.now()
      };
      setUndoStack([initialState]);
      setRedoStack([]);
    }
  }, [id, product]);


  // Load mockup when view changes
  useEffect(() => {
    if (!product?.design?.views) return;
    const existingMockup = mockupImagesByView[currentView];
    if (!existingMockup) {
      loadMockupForView(currentView, product.design.views);
    } else {
      const size = imageSizesByView[currentView];
      if (size && size.width > 0) {
        setStageSize({ width: canvasWidth, height: canvasHeight });
      }
    }
  }, [currentView, product?.design?.views, loadMockupForView, mockupImagesByView, imageSizesByView, canvasWidth, canvasHeight]);

  // Auto-select first placeholder when view changes
  useEffect(() => {
    if (product?.design?.views) {
      const view = product.design.views.find(v => v.key === currentView);
      if (view?.placeholders?.[0]) {
        setSelectedPlaceholderId(view.placeholders[0].id);
      }
    }
  }, [currentView, product]);

  // Reset selections when product changes (but not if we just restored from session)
  useEffect(() => {
    if (restoredFromSessionRef.current) return;
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPrintMethodsByView({});
  }, [product?._id]);

  // Load designData.previews from the storeProduct document whenever storeProductId is resolved
  useEffect(() => {
    if (!storeProductId) return;
    storeProductsApi.getById(storeProductId)
      .then(resp => {
        const previews = resp?.data?.designData?.previews;
        if (previews && typeof previews === 'object') {
          setSavedMockupPreviews(previews as Record<string, string>);
        }
        const selectedPrintMethods = resp?.data?.designData?.selectedPrintMethodsByView;
        if (selectedPrintMethods && typeof selectedPrintMethods === 'object') {
          setSelectedPrintMethodsByView(selectedPrintMethods as Record<string, string | null>);
        }
      })
      .catch(() => { });
  }, [storeProductId]);


  // Get current view data
  const currentViewData = useMemo(() => {
    if (!product?.design?.views) return null;
    return product.design.views.find((v: ProductView) => v.key === currentView);
  }, [product, currentView]);

  // Use the same default physical dimensions as the admin ProductImageConfigurator
  const DEFAULT_PHYSICAL_WIDTH = 20;
  const DEFAULT_PHYSICAL_HEIGHT = 24;
  const DEFAULT_PHYSICAL_LENGTH = 18;

  // Calculate PX_PER_INCH based on physical dimensions (matches CanvasMockup.tsx exactly)
  const PX_PER_INCH = useMemo(() => {
    // Prefer persisted physicalDimensions from the product.
    // If they are missing (older products), fall back to the same defaults
    // that the admin ProductImageConfigurator uses so both UIs stay in sync.
    const physicalWidth =
      product?.design?.physicalDimensions?.width ?? DEFAULT_PHYSICAL_WIDTH;
    const physicalHeight =
      product?.design?.physicalDimensions?.height ?? DEFAULT_PHYSICAL_HEIGHT;

    if (!physicalWidth || !physicalHeight || physicalWidth <= 0 || physicalHeight <= 0) {
      console.warn('Could not determine physical dimensions, using hardcoded fallback PX_PER_INCH');
      return 10; // Very last-resort fallback
    }

    const scaleX = effectiveCanvasWidth / physicalWidth;
    const scaleY = effectiveCanvasHeight / physicalHeight;
    const pxPerInch = Math.min(scaleX, scaleY);

    console.log('Calculated PX_PER_INCH (DesignEditor):', {
      physicalWidth,
      physicalHeight,
      effectiveCanvasWidth,
      effectiveCanvasHeight,
      scaleX,
      scaleY,
      pxPerInch
    });

    return pxPerInch;
  }, [product?.design?.physicalDimensions, effectiveCanvasWidth, effectiveCanvasHeight]);

  // Helper function to convert inches to pixels (matches CanvasMockup.tsx)
  const inchesToPixels = useCallback((inches: number): number => {
    return inches * PX_PER_INCH;
  }, [PX_PER_INCH]);

  // Bounding box of placed elements per view in sq inches, used for print-method pricing.
  const [actualDesignAreaSqIn, setActualDesignAreaSqIn] = useState(0);
  const [designAreaByView, setDesignAreaByView] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!PX_PER_INCH || PX_PER_INCH <= 0 || !stageRef.current || elements.length === 0) {
      setActualDesignAreaSqIn(0);
      setDesignAreaByView(prev => ({ ...prev, [currentView]: 0 }));
      return;
    }

    const stage = stageRef.current;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasAny = false;

    for (const el of elements) {
      const node = stage.findOne('#' + el.id);
      if (!node) continue;
      try {
        const rect = node.getClientRect({ relativeTo: stage });
        if (!rect || rect.width <= 0 || rect.height <= 0) continue;
        hasAny = true;
        minX = Math.min(minX, rect.x);
        minY = Math.min(minY, rect.y);
        maxX = Math.max(maxX, rect.x + rect.width);
        maxY = Math.max(maxY, rect.y + rect.height);
      } catch {
        // Node may not be mounted during a view switch.
      }
    }

    if (!hasAny) {
      setActualDesignAreaSqIn(0);
      setDesignAreaByView(prev => ({ ...prev, [currentView]: 0 }));
      return;
    }

    const bboxW = Math.max(0, maxX - minX);
    const bboxH = Math.max(0, maxY - minY);
    const area = (bboxW / PX_PER_INCH) * (bboxH / PX_PER_INCH);
    setActualDesignAreaSqIn(area);
    setDesignAreaByView(prev => ({ ...prev, [currentView]: area }));
  }, [elements, PX_PER_INCH, currentView]);

  // Get all placeholders for current view.
  // IMPORTANT: Use the exact same inches → pixels mapping as `CanvasMockup.tsx`
  // so that the pink placeholder rectangles line up with the garment base image.
  // This means anchoring to the padded canvas, not re-normalizing to the mockup
  // image bounds or `normalizedPosition`, which can be inconsistent for older data.
  const placeholders = useMemo(() => {
    const sourcePlaceholders = currentViewData?.placeholders || []; // Strictly use design.views data

    if (!sourcePlaceholders || sourcePlaceholders.length === 0) {
      console.log('No placeholders found for current view');
      return [];
    }

    const visualColors = ['#ec4899', '#8ce2f5', '#a3ffc6', '#f4fea9', '#ffe2db']; // light blue, light green, light yellow, light pink

    const converted = sourcePlaceholders.map((placeholder: Placeholder, index: number) => {
      const visualColor = visualColors[index % visualColors.length];
      const scale = placeholder.scale ?? 1.0;
      const isPolygon = placeholder.shapeType === 'polygon' && placeholder.polygonPoints && placeholder.polygonPoints.length >= 3;

      let xPx: number;
      let yPx: number;
      let widthPx: number;
      let heightPx: number;

      // Match `CanvasMockup.tsx`: always position placeholders using inches +
      // PX_PER_INCH from the padded canvas origin. This keeps editor and admin
      // aligned and avoids drift when mockup aspect ratios or normalized
      // positions differ between views.
      xPx = canvasPadding + inchesToPixels(placeholder.xIn);
      yPx = canvasPadding + inchesToPixels(placeholder.yIn);
      widthPx = inchesToPixels(placeholder.widthIn) * scale;
      heightPx = inchesToPixels(placeholder.heightIn) * scale;

      // For polygons, convert polygon points from inches to pixels (legacy).
      const polygonPointsPx = isPolygon
        ? placeholder.polygonPoints!.map((pt) => [
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
        original: { ...placeholder, color: visualColor }, // Overwrite color for UI only
        isPolygon,
        polygonPointsPx
      };
    });

    return converted;
  }, [currentViewData, PX_PER_INCH, inchesToPixels, canvasPadding]);

  // --- DYNAMIC DPI RECALCULATION ---
  // Runs whenever image elements change size/position, or placeholder sizes change.
  // Uses the accurate useDpiCalculation hook with physical placeholder dimensions.
  useEffect(() => {
    const imageElements = elements.filter(
      el => el.type === 'image' && el.naturalWidth && el.naturalHeight && el.width && el.height
    );

    if (imageElements.length === 0 || placeholders.length === 0) {
      setLowDpiImages({});
      return;
    }

    // We need placeholder physical dimensions. PX_PER_INCH converts px <-> inches.
    const primaryPlaceholder = placeholders[0];
    if (!primaryPlaceholder || PX_PER_INCH <= 0) return;

    const widthInches = primaryPlaceholder.width / PX_PER_INCH;
    const heightInches = primaryPlaceholder.height / PX_PER_INCH;

    const placeholderConfig = {
      widthPx: primaryPlaceholder.width,
      heightPx: primaryPlaceholder.height,
      widthInches,
      heightInches,
    };

    const newLowDpiMap: Record<string, number> = {};
    let currentSelectedResult = null;

    imageElements.forEach(el => {
      if (!el.naturalWidth || !el.naturalHeight || !el.width || !el.height) return;

      const result = calculateDpi(
        el.naturalWidth,
        el.naturalHeight,
        el.width,
        el.height,
        placeholderConfig
      );

      if (result.effectiveDPI < 300) {
        newLowDpiMap[el.id] = result.effectiveDPI;
      }

      // If this is the selected element, save its result for the floating indicator
      if (selectedIds.length === 1 && selectedIds[0] === el.id) {
        currentSelectedResult = result;
      }
    });

    setLowDpiImages(newLowDpiMap);
    setSelectedDpiResult(currentSelectedResult);
  }, [elements, placeholders, PX_PER_INCH, calculateDpi, selectedIds, previewMode]);

  // Automatically recover naturalWidth/Height for elements missing them (reloaded from DB)
  useEffect(() => {
    elements.forEach(el => {
      if (el.type === 'image' && el.imageUrl && (!el.naturalWidth || !el.naturalHeight)) {
        const img = new window.Image();
        img.onload = () => {
          setElements(prev => prev.map(e => e.id === el.id ? {
            ...e,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          } : e));
        };
        img.src = el.imageUrl;
      }
    });
  }, [elements]);

  // Primary print area (first placeholder or default)
  const printArea = useMemo(() => {
    if (placeholders.length > 0) {
      const placeholder = placeholders[0];
      return {
        x: placeholder.x,
        y: placeholder.y,
        width: placeholder.width,
        height: placeholder.height
      };
    }
    // Default print area
    return {
      x: stageSize.width * 0.1,
      y: stageSize.height * 0.15,
      width: stageSize.width * 0.8,
      height: stageSize.height * 0.6
    };
  }, [placeholders, stageSize]);

  // Calculate style for the mobile selection toolbar to position it above the selected element
  const mobileToolbarStyle = useMemo(() => {
    if (!isMobile || selectedIds.length !== 1 || previewMode) {
      return { top: '1rem', left: '50%', transform: 'translateX(-50%)' };
    }

    const element = elements.find(el => el.id === selectedIds[0]);
    if (!element) return { top: '1rem', left: '50%', transform: 'translateX(-50%)' };

    const bounds = calculateRotatedBounds(element.x, element.y, element.width || 0, element.height || 0, element.rotation || 0);

    // Position 80px above the top of the element, or below if near the top edge
    let topPx = bounds.minY - 100;
    if (topPx < 40) {
      topPx = bounds.maxY + 40;
    }

    // Center horizontally relative to element
    const centerX = (bounds.minX + bounds.maxX) / 2;

    // Ensure it doesn't go off screen
    const padding = 20;
    const safeLeft = Math.max(padding, Math.min(centerX, stageSize.width - padding));

    return {
      position: 'absolute' as const,
      top: `${(topPx / stageSize.height) * 100}%`,
      left: `${(safeLeft / stageSize.width) * 100}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: 40,
      width: '90%',
      maxWidth: '400px'
    };
  }, [isMobile, selectedIds, elements, stageSize, previewMode]);

  // Available views from product
  const availableViews = useMemo(() => {
    if (!product?.design?.views) return [];
    return product.design.views.map((v: ProductView) => v.key);
  }, [product]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      saveToHistory(true); // Immediate save for auto-save
    }, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [elements]);

  // Attach transformer to selected element
  useEffect(() => {
    if (selectedIds.length === 1 && transformerRef.current && stageRef.current && !previewMode) {
      const stage = stageRef.current;
      const selectedId = selectedIds[0];
      const selectedNode = stage.findOne(`#${selectedId}`);

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedIds, previewMode, elements]); // Add elements to dependency to update transformer when text changes



  // History management - proper undo/redo stack pattern
  // Get elements for current view only
  const getCurrentViewElements = useCallback(() => {
    return elements.filter(el => !el.view || el.view === currentView);
  }, [elements, currentView]);

  // Save history state (debounced for rapid updates like dragging)
  const saveToHistory = useCallback((immediate = false) => {
    // Don't save if we're currently restoring history
    if (isRestoringHistoryRef.current) {
      return;
    }

    const currentViewElements = getCurrentViewElements();
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(currentViewElements)),
      view: currentView,
      timestamp: Date.now()
    };

    const saveAction = () => {
      setUndoStack(prev => {
        const newStack = [...prev, newState];
        // Limit stack size
        if (newStack.length > maxHistory) {
          newStack.shift();
        }
        return newStack;
      });
      // Clear redo stack when new action is performed
      setRedoStack([]);
    };

    if (immediate) {
      // Clear any pending debounced save
      if (historySaveTimeoutRef.current) {
        clearTimeout(historySaveTimeoutRef.current);
        historySaveTimeoutRef.current = null;
      }
      saveAction();
    } else {
      // Debounce rapid updates (like dragging)
      if (historySaveTimeoutRef.current) {
        clearTimeout(historySaveTimeoutRef.current);
      }
      historySaveTimeoutRef.current = setTimeout(() => {
        saveAction();
        historySaveTimeoutRef.current = null;
      }, 300); // 300ms debounce for drag/transform operations
    }
  }, [elements, currentView, getCurrentViewElements]);

  // Undo: pop from undoStack, push to redoStack, restore state
  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;

      const stateToRestore = prev[prev.length - 1];
      const newUndoStack = prev.slice(0, -1);

      // Push current state to redo stack before restoring
      const currentViewElements = getCurrentViewElements();
      const currentState: HistoryState = {
        elements: JSON.parse(JSON.stringify(currentViewElements)),
        view: currentView,
        timestamp: Date.now()
      };

      setRedoStack(prevRedo => [...prevRedo, currentState]);

      // Restore the state
      isRestoringHistoryRef.current = true;

      // Merge restored elements with elements from other views
      setElements(prevElements => {
        const otherViewElements = prevElements.filter(el => el.view && el.view !== stateToRestore.view);
        const restoredElements = stateToRestore.elements.map((el: CanvasElement) => ({
          ...el,
          view: stateToRestore.view
        }));
        return [...otherViewElements, ...restoredElements];
      });

      setTimeout(() => {
        isRestoringHistoryRef.current = false;
      }, 0);

      return newUndoStack;
    });
  }, [currentView, getCurrentViewElements]);

  // Redo: pop from redoStack, push to undoStack, restore state
  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;

      const stateToRestore = prev[prev.length - 1];
      const newRedoStack = prev.slice(0, -1);

      // Push current state to undo stack before restoring
      const currentViewElements = getCurrentViewElements();
      const currentState: HistoryState = {
        elements: JSON.parse(JSON.stringify(currentViewElements)),
        view: currentView,
        timestamp: Date.now()
      };

      setUndoStack(prevUndo => [...prevUndo, currentState]);

      // Restore the state
      isRestoringHistoryRef.current = true;

      // Merge restored elements with elements from other views
      setElements(prevElements => {
        const otherViewElements = prevElements.filter(el => el.view && el.view !== stateToRestore.view);
        const restoredElements = stateToRestore.elements.map((el: CanvasElement) => ({
          ...el,
          view: stateToRestore.view
        }));
        return [...otherViewElements, ...restoredElements];
      });

      setTimeout(() => {
        isRestoringHistoryRef.current = false;
      }, 0);

      return newRedoStack;
    });
  }, [currentView, getCurrentViewElements]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // When typing in any input/textarea/contentEditable, let the browser handle keys natively
      const activeEl = document.activeElement;
      const isTypingInInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isTypingInInput) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            copySelected();
            break;
          case 'v':
            e.preventDefault();
            paste();
            break;
          case 'd':
            e.preventDefault();
            duplicateSelected();
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) ungroupSelected();
            else groupSelected();
            break;
          case '0':
            e.preventDefault();
            setZoom(100);
            break;
          case '1':
            e.preventDefault();
            fitToScreen();
            break;
          case '=':
          case '+':
            e.preventDefault();
            setZoom(prev => Math.min(500, prev + 10));
            break;
          case '-':
            e.preventDefault();
            setZoom(prev => Math.max(10, prev - 10));
            break;
        }
      } else if (e.key === 'Delete') {
        // Only Delete key deletes layers, not Backspace
        // Backspace is reserved for text editing
        deleteSelected();
      } else if (e.key === 'Backspace') {
        // Backspace should only work for text editing, not layer deletion
        // Check if user is in an input field - if so, don't delete layer
        const activeElement = document.activeElement;
        const isInInput = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable
        );
        // Only delete layer if NOT in an input field
        // This prevents accidental deletion when editing text
        if (!isInInput) {
          deleteSelected();
        }
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        nudgeSelected(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements]);

  const {
    addElement,
    updateElement,
    deleteSelected,
    duplicateSelected,
    selectAll,
    nudgeSelected,
    bringToFront,
    sendToBack,
  } = useCanvasElements({
    elements,
    setElements,
    selectedIds,
    setSelectedIds,
    placeholders,
    currentView,
    product,
    saveToHistory,
    registerEditActivity,
    setHasUnsavedChanges,
    setDirtyViewsForDesign,
    setPlacementForView,
    transformerRef,
    stageRef,
  });

  const copySelected = () => {
    // Implementation for copy
    toast.info('Copy functionality');
  };

  const paste = () => {
    // Implementation for paste
    toast.info('Paste functionality');
  };


  const groupSelected = () => {
    if (selectedIds.length > 1) {
      // Group implementation
      toast.info('Group functionality');
    }
  };

  const ungroupSelected = () => {
    // Ungroup implementation
    toast.info('Ungroup functionality');
  };


  const fitToScreen = () => {
    // Better fit to screen logic
    const container = canvasContainerRef.current?.parentElement;
    if (container) {
      const padding = 20;
      const availableWidth = container.clientWidth - (padding * 2);
      const availableHeight = container.clientHeight - (padding * 2);

      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const fitZoom = Math.min(scaleX, scaleY, 1.0) * 100;

      if (isMobile) {
        setZoom(75); // Fixed 75% for mobile as requested
      } else {
        setZoom(Math.floor(fitZoom));
      }
    } else {
      setZoom(isMobile ? 75 : 100);
    }
    setStagePos({ x: 0, y: 0 });
  };

  // Fit to screen on mount or when product finishes loading
  useEffect(() => {
    if (!isLoadingProduct && product) {
      // Small delay to ensure container dims are ready
      const timer = setTimeout(() => {
        fitToScreen();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoadingProduct, product]);

  // Fit to screen on window resize
  useEffect(() => {
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  // Add image to canvas from URL
  const addImageToCanvas = useCallback((imageUrl: string, assetName?: string) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      // Use selected placeholder if available, otherwise use first placeholder or printArea
      let targetPlaceholder = null;

      // Get the latest selected placeholder ID from ref
      const currentSelectedId = selectedPlaceholderIdRef.current;
      console.log('addImageToCanvas - selectedPlaceholderId (from ref):', currentSelectedId);
      console.log('addImageToCanvas - selectedPlaceholderId (from state):', selectedPlaceholderId);
      console.log('addImageToCanvas - available placeholders:', placeholders.map(p => p.id));

      if (currentSelectedId) {
        targetPlaceholder = placeholders.find(p => p.id === currentSelectedId) || null;
        console.log('Found placeholder by selectedPlaceholderId:', targetPlaceholder);
      }

      if (!targetPlaceholder && placeholders.length > 0) {
        targetPlaceholder = placeholders[0];
        console.log('Using first placeholder as fallback:', targetPlaceholder);
      }

      const targetArea = targetPlaceholder || printArea;
      console.log('Final target area for image:', {
        x: targetArea.x,
        y: targetArea.y,
        width: targetArea.width,
        height: targetArea.height,
        isPlaceholder: !!targetPlaceholder,
        placeholderId: targetPlaceholder?.id
      });

      // Calculate aspect ratios
      const imageAspect = img.width / img.height;
      const placeholderAspect = targetArea.width / targetArea.height;

      // Fit image within placeholder while maintaining aspect ratio
      let finalWidth: number;
      let finalHeight: number;

      if (imageAspect > placeholderAspect) {
        // Image is wider - fit to width
        finalWidth = targetArea.width;
        finalHeight = targetArea.width / imageAspect;
      } else {
        // Image is taller - fit to height
        finalHeight = targetArea.height;
        finalWidth = targetArea.height * imageAspect;
      }

      // Ensure image doesn't exceed placeholder dimensions
      finalWidth = Math.min(finalWidth, targetArea.width);
      finalHeight = Math.min(finalHeight, targetArea.height);

      // Center the image within the placeholder
      const x = targetArea.x + (targetArea.width - finalWidth) / 2;
      const y = targetArea.y + (targetArea.height - finalHeight) / 2;

      // Apply placeholder rotation if any
      const rotation = targetPlaceholder?.rotation || 0;

      console.log('Adding image to placeholder:', {
        placeholder: targetArea,
        imageSize: { width: img.width, height: img.height },
        finalSize: { width: finalWidth, height: finalHeight },
        position: { x, y },
        rotation
      });

      const elementId = addElement({
        type: 'image',
        imageUrl,
        name: assetName,
        x,
        y,
        width: finalWidth,
        height: finalHeight,
        rotation,
        placeholderId: targetPlaceholder?.id || undefined,
        view: currentView, // Store which view this image belongs to
        naturalWidth,  // Store for accurate DPI calculation on resize
        naturalHeight,
      });

      // Compute and store normalized placement if adding to a placeholder
      if (targetPlaceholder?.id) {
        const printAreaPx: PrintAreaPixels = {
          x: targetArea.x,
          y: targetArea.y,
          w: targetArea.width,
          h: targetArea.height,
        };
        const placement = pixelsToNormalized(
          { x, y, width: finalWidth, height: finalHeight, rotation },
          printAreaPx,
          currentView as ViewKey,
          targetPlaceholder.id
        );
        placement.aspectRatio = imageAspect;
        setPlacementForView(currentView, targetPlaceholder.id, placement);
        console.log('📐 Stored normalized placement for image:', {
          placeholderId: targetPlaceholder.id,
          view: currentView,
          placement,
        });
      }

      // Select the newly added image
      setSelectedIds([elementId]);

      // On mobile: close menu, show canvas, DON'T open properties automatically
      if (isMobile) {
        isAddingAssetRef.current = true; // Mark as asset addition to prevent auto-opening properties
        setIsMobileMenuOpen(false);
        setMobileToolStage('none');
        setShowRightPanel(false);
        setShowLeftPanel(false);
      } else {
        // Desktop: open properties as before
        setRightPanelTab('properties');
        setShowRightPanel(true);
      }

      // toast.success('Image added to canvas');
    };
    img.onerror = () => {
      toast.error('Failed to load image');
    };
    img.src = imageUrl;
  }, [placeholders, printArea, addElement, currentView, setPlacementForView]);

  // Toggle color selection
  const handleColorToggle = useCallback((color: string) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        // When deselecting a color, clear its size selection
        setSelectedSizesByColor(prevSizes => {
          const newSizes = { ...prevSizes };
          delete newSizes[color];
          return newSizes;
        });
        return prev.filter(c => c !== color);
      } else {
        // When selecting a color, make it the primary (first) color while preserving others
        const withoutColor = prev.filter(c => c !== color);
        return [color, ...withoutColor];
      }
    });
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  }, []);

  // Toggle size selection (backward compatibility - for standalone size selection)
  const handleSizeToggle = useCallback((size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
  }, []);

  // Toggle size selection for a specific color (allows multiple sizes per color)
  const handleSizeToggleForColor = useCallback((color: string, size: string) => {
    setSelectedSizesByColor(prev => {
      const colorSizes = prev[color] || [];
      // If size is already selected, remove it; otherwise, add it
      const updatedSizes = colorSizes.includes(size)
        ? colorSizes.filter(s => s !== size)
        : [...colorSizes, size];
      return {
        ...prev,
        [color]: updatedSizes,
      };
    });
  }, []);

  // File upload - always adds to preview library for manual selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let successCount = 0;

    // Process each selected file
    Array.from(files).forEach((file) => {
      // Validation
      const maxSize = file.type === 'image/svg+xml' ? 20 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // Always add to preview library - user must click to add to canvas
        setUploadedImagePreview(prev => [...prev, { url: imageUrl, name: file.name }]);

        // Add to preview library then canvas.
        // The reactive DPI useEffect will automatically classify DPI once the element
        // is added to state with its naturalWidth/naturalHeight.
        addImageToCanvas(imageUrl, file.name);

        successCount++;
        if (successCount === Array.from(files).length) {
          toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added to library and canvas`);
        }
      };
      reader.onerror = () => {
        toast.error(`Failed to read ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be selected again
    e.target.value = '';
  };

  // Handle image click from upload panel - apply to selected placeholder
  const handleImageClick = (imageUrl: string) => {
    if (selectedPlaceholderId) {
      setDesignUrlForView(currentView, selectedPlaceholderId, imageUrl);
      toast.success('Design applied to placeholder');
    } else if (placeholders.length === 1) {
      // Auto-select if only one placeholder
      setSelectedPlaceholderId(placeholders[0].id);
      selectedPlaceholderIdRef.current = placeholders[0].id;
      setDesignUrlForView(currentView, placeholders[0].id, imageUrl);
      toast.success('Design applied to placeholder');
    } else {
      toast.error('Please select a placeholder first');
    }
  };

  // Add text
  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    // Require a placeholder - text must be created within a print area
    const targetPlaceholder = selectedPlaceholderIdRef.current
      ? placeholders.find(p => p.id === selectedPlaceholderIdRef.current)
      : (placeholders.length > 0 ? placeholders[0] : null);

    if (!targetPlaceholder) {
      toast.error('Please select a print area (placeholder) before adding text');
      return;
    }

    const targetArea = {
      x: targetPlaceholder.x,
      y: targetPlaceholder.y,
      width: targetPlaceholder.width,
      height: targetPlaceholder.height,
    };

    addElement({
      type: 'text',
      text: textInput,
      x: targetArea.x,
      y: targetArea.y + targetArea.height / 2,
      width: targetArea.width,
      fontSize,
      fontFamily: selectedFont,
      fill: textColor,
      align: 'center',
      view: currentView,
      placeholderId: targetPlaceholder.id
    });
    setTextInput('');
    // toast.success('Text added');
  };

  // Add text with params (for new TextPanel)
  const handleAddTextWithParams = (text: string, font: string) => {
    // If a text element is already selected, treat this as a font change
    const selectedTextElement =
      selectedIds.length === 1
        ? elements.find((el) => el.id === selectedIds[0] && el.type === 'text')
        : undefined;

    if (selectedTextElement) {
      const newText = text.trim();
      updateElement(
        selectedTextElement.id,
        {
          fontFamily: font,
          ...(newText ? { text: newText } : {}),
        },
        true,
      );

      if (!isMobile) {
        setRightPanelTab('properties');
        setShowRightPanel(true);
      }
      return;
    }
    //default text inside placeholder
    const initialText = text.trim() || 'Enter Text';
    // Require a placeholder - text must be created within a print area
    const targetPlaceholder = selectedPlaceholderIdRef.current
      ? placeholders.find(p => p.id === selectedPlaceholderIdRef.current)
      : (placeholders.length > 0 ? placeholders[0] : null);

    if (!targetPlaceholder) {
      toast.error('Please select a print area (placeholder) before adding text');
      return;
    }

    const targetArea = {
      x: targetPlaceholder.x,
      y: targetPlaceholder.y,
      width: targetPlaceholder.width,
      height: targetPlaceholder.height,
    };

    addElement({
      type: 'text',
      text: initialText,
      x: targetArea.x,
      y: targetArea.y + targetArea.height / 2 - 12, // Center vertically (half of default fontSize 24)
      width: targetArea.width, // Constrain text to placeholder width
      fontSize: 24,
      fontFamily: font,
      fill: '#000000',
      align: 'center',
      view: currentView,
      placeholderId: targetPlaceholder.id
    });

    // Select the newly added text (addElement already sets selectedIds)
    // On mobile: close menu, show canvas, DON'T open properties automatically
    if (isMobile) {
      isAddingAssetRef.current = true; // Mark as asset addition to prevent auto-opening properties
      setIsMobileMenuOpen(false);
      setMobileToolStage('none');
      setShowRightPanel(false);
      setShowLeftPanel(false);
    } else {
      // Desktop: open properties as before
      setRightPanelTab('properties');
      setShowRightPanel(true);
    }

    // toast.success('Text added');
  };

  // Add shape
  const handleAddShape = (shapeType: CanvasElement['shapeType']) => {
    // Use selected placeholder if available, otherwise use first placeholder or printArea
    const targetPlaceholder = selectedPlaceholderIdRef.current
      ? placeholders.find(p => p.id === selectedPlaceholderIdRef.current)
      : (placeholders.length > 0 ? placeholders[0] : null);
    const targetArea = targetPlaceholder || printArea;

    // Calculate size to fit within placeholder (max 100px or 80% of placeholder size)
    const maxSize = Math.min(100, Math.min(targetArea.width, targetArea.height) * 0.8);

    addElement({
      type: 'shape',
      shapeType,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      x: targetArea.x + targetArea.width / 2 - maxSize / 2,
      y: targetArea.y + targetArea.height / 2 - maxSize / 2,
      width: maxSize,
      height: maxSize,
      fillColor: '#000000',
      strokeColor: '#000000',
      strokeWidth: 2,
      view: currentView,
      placeholderId: targetPlaceholder?.id || undefined
    });

    // On mobile: close menu, show canvas, DON'T open properties automatically
    if (isMobile) {
      isAddingAssetRef.current = true; // Mark as asset addition to prevent auto-opening properties
      setIsMobileMenuOpen(false);
      setMobileToolStage('none');
      setShowRightPanel(false);
      setShowLeftPanel(false);
    } else {
      // Desktop: open properties as before
      setRightPanelTab('properties');
      setShowRightPanel(true);
    }
  };

  // Export
  const handleExport = (format: 'png' | 'jpg' | 'svg') => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      quality: 1,
      pixelRatio: 2
    });

    const link = document.createElement('a');
    link.download = `design.${format}`;
    link.href = dataURL;
    link.click();
    toast.success(`Design exported as ${format.toUpperCase()}`);
  };

  const handleExportPreview = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!stageRef.current) {
        toast.error('Preview is not available to export');
        return;
      }

      const mime = format === 'png' ? 'image/png' : 'image/jpeg';

      // Ensure latest frame is rendered
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const dataUrl = stageRef.current.toDataURL({
        mimeType: mime,
        quality: 1,
        pixelRatio: 2,
      });

      const blob = await fetch(dataUrl).then(r => r.blob());
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preview.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Preview exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Error exporting preview image:', err);
      toast.error('Error exporting preview image');
    }
  };



  const capturePreviewImage = useCallback(async (viewKey?: string): Promise<string | null> => {
    try {
      if (!stageRef.current) {
        console.warn('Stage ref not available for capturePreviewImage');
        return null;
      }

      // Give Konva a moment to render any pending changes
      await new Promise(resolve => setTimeout(resolve, 100));
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      // Force every Konva layer to flush its draw queue synchronously so
      // the design-elements layer is fully painted before we read pixels.
      stageRef.current.getLayers().forEach((l: any) => l.draw());

      return new Promise((resolve) => {
        stageRef.current!.toBlob(
          async (blob) => {
            if (!blob) {
              console.error('Failed to convert stage to blob');
              resolve(null);
              return;
            }

            try {
              const formData = new FormData();
              const fileName = viewKey ? `preview-${viewKey}.png` : 'preview.png';
              formData.append('image', blob, fileName);

              const useAuthUpload =
                !!localStorage.getItem('token') || isEmbeddedShopifyApp();
              const path = useAuthUpload ? '/upload/image' : '/upload/guest-image';

              const response = await fetchWithApiAuth(path, {
                method: 'POST',
                headers: { 'ngrok-skip-browser-warning': 'true' },
                credentials: 'include',
                body: formData,
              });

              const data = await response.json();
              if (data.success && data.url) {
                console.log(`Preview image uploaded successfully for ${viewKey || 'current'} view:`, data.url);
                resolve(data.url);
              } else {
                console.error('Failed to upload preview image:', data.message || 'Unknown error');
                resolve(null);
              }
            } catch (error) {
              console.error('Error uploading preview image:', error);
              resolve(null);
            }
          },
          {
            mimeType: 'image/png',
            pixelRatio: 2,
          }
        );
      });
    } catch (error) {
      console.error('Error capturing preview image:', error);
      return null;
    }
  }, []);

  /**
   * Draws all design elements for the given view onto an offscreen <canvas>
   * with a TRANSPARENT background (no Konva stage interaction), then uploads
   * the resulting PNG.  Avoids the Konva toBlob canvas-taint / hang issue.
   */
  const captureDesignOnlyImage = useCallback(async (viewKey: string): Promise<string | null> => {
    if (!stageRef.current) return null;

    try {
      const viewElements = elements.filter(
        el => (el.view === viewKey || !el.view) && el.visible !== false
      );
      if (viewElements.length === 0) {
        console.log(`[captureDesignOnlyImage] no elements for view "${viewKey}"`);
        return null;
      }

      const pixelRatio = 2;

      // ── Compute placeholder bounds so we capture ONLY the print area ────
      // Mirroring RealisticWebGLPreview / placementUtils: translate the drawing
      // context by (-phStageX, -phStageY) so elements render relative to the
      // placeholder origin.  The server then just scales and places this image
      // at the mockup's placeholder position — no coordinate guesswork needed.
      const CANVAS_PADDING_PX = 40;
      const EFFECTIVE_W_PX = 800 - CANVAS_PADDING_PX * 2;
      const EFFECTIVE_H_PX = 600 - CANVAS_PADDING_PX * 2;

      const view = (product?.design?.views as ProductView[] | undefined)
        ?.find((v: ProductView) => v.key === viewKey);
      const ph = view?.placeholders?.[0] as any;
      const physDims = product?.design?.physicalDimensions as { width: number; height: number } | undefined;

      let phOffsetX = 0;
      let phOffsetY = 0;
      let canvasW = stageRef.current.width() * pixelRatio;
      let canvasH = stageRef.current.height() * pixelRatio;

      if (ph && physDims && physDims.width > 0 && physDims.height > 0) {
        const pxPerInch = Math.min(EFFECTIVE_W_PX / physDims.width, EFFECTIVE_H_PX / physDims.height);
        let phStageX: number, phStageY: number, phStageW: number, phStageH: number;

        if (ph.xIn !== undefined) {
          phStageX = CANVAS_PADDING_PX + (ph.xIn || 0) * pxPerInch;
          phStageY = CANVAS_PADDING_PX + (ph.yIn || 0) * pxPerInch;
          phStageW = (ph.widthIn || 0) * pxPerInch;
          phStageH = (ph.heightIn || 0) * pxPerInch;
        } else {
          phStageX = ph.x || 0;
          phStageY = ph.y || 0;
          phStageW = ph.width || 0;
          phStageH = ph.height || 0;
        }

        if (phStageW > 0 && phStageH > 0) {
          phOffsetX = phStageX;
          phOffsetY = phStageY;
          canvasW = Math.round(phStageW * pixelRatio);
          canvasH = Math.round(phStageH * pixelRatio);
          console.log(
            `[captureDesignOnlyImage] placeholder capture ${canvasW}×${canvasH}` +
            ` (stage offset ${phOffsetX.toFixed(1)},${phOffsetY.toFixed(1)})`
          );
        }
      }

      const offscreen = document.createElement('canvas');
      offscreen.width = canvasW;
      offscreen.height = canvasH;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      // Scale for pixel ratio; translate so the placeholder top-left is (0,0).
      // Elements drawn at their stage coords will land at the correct position
      // within the placeholder-sized canvas, and anything outside is clipped.
      ctx.scale(pixelRatio, pixelRatio);
      if (phOffsetX !== 0 || phOffsetY !== 0) {
        ctx.translate(-phOffsetX, -phOffsetY);
      }

      const sorted = [...viewElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      for (const el of sorted) {
        ctx.save();

        if (el.blendMode && el.blendMode !== 'normal') {
          ctx.globalCompositeOperation = el.blendMode as GlobalCompositeOperation;
        }
        ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;

        // Rotation around element centre
        if (el.rotation) {
          const cx = (el.x || 0) + (el.width || 0) / 2;
          const cy = (el.y || 0) + (el.height || 0) / 2;
          ctx.translate(cx, cy);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        // Shadow
        if (el.shadowBlur && el.shadowBlur > 0) {
          const sA = el.shadowOpacity ?? 0.5;
          ctx.shadowBlur = el.shadowBlur;
          ctx.shadowOffsetX = el.shadowOffsetX || 0;
          ctx.shadowOffsetY = el.shadowOffsetY || 0;
          ctx.shadowColor = el.shadowColor
            ? (el.shadowColor.startsWith('#')
              ? el.shadowColor + Math.round(sA * 255).toString(16).padStart(2, '0')
              : el.shadowColor)
            : `rgba(0,0,0,${sA})`;
        }

        if (el.type === 'image' && el.imageUrl) {
          try {
            const img = await getCachedImage(el.imageUrl);
            const elX = el.x || 0;
            const elY = el.y || 0;
            const elW = el.width || 0;
            const elH = el.height || 0;

            // CSS image filters
            const filters: string[] = [];
            if (el.brightness) filters.push(`brightness(${1 + el.brightness / 100})`);
            if (el.contrast) filters.push(`contrast(${1 + el.contrast / 100})`);
            if (el.saturation) filters.push(`saturate(${1 + el.saturation / 100})`);
            if (el.hue) filters.push(`hue-rotate(${el.hue}deg)`);
            if (el.blur && el.blur > 0) filters.push(`blur(${el.blur}px)`);
            if (filters.length) ctx.filter = filters.join(' ');

            if (el.flipX || el.flipY) {
              ctx.translate(el.flipX ? elX + elW : elX, el.flipY ? elY + elH : elY);
              ctx.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
              ctx.drawImage(img, 0, 0, elW, elH);
            } else {
              ctx.drawImage(img, elX, elY, elW, elH);
            }
            ctx.filter = 'none';
          } catch (imgErr) {
            console.warn(`[captureDesignOnlyImage] image ${el.id} skipped:`, imgErr);
          }

        } else if (el.type === 'text' && el.text) {
          const fontSize = el.fontSize || 24;
          const fontFamily = el.fontFamily || 'Arial';
          const isBold = el.fontStyle?.includes('bold');
          const isItalic = el.fontStyle?.includes('italic');
          ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px "${fontFamily}"`;
          ctx.fillStyle = el.fill || '#000000';
          ctx.textBaseline = 'top';

          const elX = el.x || 0;
          const elY = el.y || 0;
          const lsp = el.letterSpacing || 0;

          // Same wrap width as Konva Text: placeholder width (inches → px), not element.width
          const phEl = el.placeholderId && view?.placeholders
            ? (view.placeholders as Placeholder[]).find((p) => p.id === el.placeholderId)
            : undefined;
          let wrapW = el.width || 400;
          if (phEl && physDims && physDims.width > 0 && physDims.height > 0) {
            const pxPerInchCap = Math.min(EFFECTIVE_W_PX / physDims.width, EFFECTIVE_H_PX / physDims.height);
            const scalePh = phEl.scale ?? 1;
            wrapW = (phEl.widthIn || 0) * pxPerInchCap * scalePh;
          }
          if (wrapW <= 0) wrapW = el.width || 400;

          const align = el.align || 'center';
          const lineHeight = fontSize * 1.2;
          const lines = wrapTextLinesForCanvasExport(ctx, el.text, wrapW);

          if (lsp > 0 && align === 'left' && lines.length === 1) {
            let xPos = elX;
            for (const char of lines[0]) {
              ctx.textAlign = 'left';
              ctx.fillText(char, xPos, elY);
              xPos += ctx.measureText(char).width + lsp;
            }
          } else {
            lines.forEach((ln, i) => {
              const drawY = elY + i * lineHeight;
              if (align === 'center') {
                ctx.textAlign = 'center';
                ctx.fillText(ln, elX + wrapW / 2, drawY);
              } else if (align === 'right') {
                ctx.textAlign = 'right';
                ctx.fillText(ln, elX + wrapW, drawY);
              } else {
                ctx.textAlign = 'left';
                ctx.fillText(ln, elX, drawY);
              }
            });
          }

        } else if (el.type === 'shape') {
          ctx.fillStyle = el.fillColor || '#000000';
          if (el.strokeWidth && el.strokeWidth > 0) {
            ctx.strokeStyle = el.strokeColor || 'transparent';
            ctx.lineWidth = el.strokeWidth;
          }

          const x = el.x || 0;
          const y = el.y || 0;
          const w = el.width || 50;
          const h = el.height || 50;

          ctx.beginPath();
          switch (el.shapeType) {
            case 'circle':
              ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
              break;
            case 'triangle':
              ctx.moveTo(x + w / 2, y);
              ctx.lineTo(x, y + h);
              ctx.lineTo(x + w, y + h);
              ctx.closePath();
              break;
            case 'star': {
              const outerR = w / 2, innerR = outerR * 0.4;
              const scx = x + w / 2, scy = y + h / 2;
              for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                if (i === 0) ctx.moveTo(scx + r * Math.cos(angle), scy + r * Math.sin(angle));
                else ctx.lineTo(scx + r * Math.cos(angle), scy + r * Math.sin(angle));
              }
              ctx.closePath();
              break;
            }
            case 'heart': {
              const sc = w / 100;
              const hcx = x + w / 2, hcy = y + h / 2;
              ctx.moveTo(hcx, hcy + 20 * sc);
              ctx.bezierCurveTo(hcx, hcy + 10 * sc, hcx - 20 * sc, hcy - 10 * sc, hcx - 30 * sc, hcy);
              ctx.bezierCurveTo(hcx - 40 * sc, hcy + 10 * sc, hcx - 30 * sc, hcy + 20 * sc, hcx - 20 * sc, hcy + 30 * sc);
              ctx.lineTo(hcx, hcy + 50 * sc);
              ctx.lineTo(hcx + 20 * sc, hcy + 30 * sc);
              ctx.bezierCurveTo(hcx + 30 * sc, hcy + 20 * sc, hcx + 40 * sc, hcy + 10 * sc, hcx + 30 * sc, hcy);
              ctx.bezierCurveTo(hcx + 20 * sc, hcy - 10 * sc, hcx, hcy + 10 * sc, hcx, hcy + 20 * sc);
              ctx.closePath();
              break;
            }
            default: // rect
              if (el.cornerRadius) {
                ctx.roundRect(x, y, w, h, el.cornerRadius);
              } else {
                ctx.rect(x, y, w, h);
              }
          }
          ctx.fill();
          if (el.strokeWidth && el.strokeWidth > 0) ctx.stroke();
        }

        ctx.restore();
      }

      const blob: Blob | null = await new Promise(resolve => {
        offscreen.toBlob(b => resolve(b), 'image/png');
      });
      if (!blob) {
        console.error('[captureDesignOnlyImage] offscreen toBlob returned null');
        return null;
      }

      const formData = new FormData();
      formData.append('image', blob, `design-only-${viewKey}.png`);
      const resp = await fetchWithApiAuth('/upload/image', {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
        credentials: 'include',
      });
      const data = await resp.json().catch(() => ({}));
      return (resp.ok && data?.success && data?.url) ? data.url : null;

    } catch (e) {
      console.error('[captureDesignOnlyImage] Error:', e);
      return null;
    }
  }, [elements, product]);

  /**
   * Captures design-only PNGs for all product views using the offscreen canvas
   * approach (reads elements state directly — no Konva stage interaction needed).
   * Also returns garmentBounds (from imageSizesByView) so the server can extract
   * the correct garment-aligned region regardless of sampleMockup aspect ratio.
   * Must finish BEFORE navigate() so stageRef.current is still available.
   */
  const captureDesignOnlyImagesAllViews = useCallback(
    async (): Promise<{
      images: Record<string, string>;
      garmentBounds: Record<string, { x: number; y: number; width: number; height: number }>;
    }> => {
      const images: Record<string, string> = {};
      const garmentBounds: Record<string, { x: number; y: number; width: number; height: number }> = {};
      if (!stageRef.current || !product?.design?.views?.length) return { images, garmentBounds };

      const views = product.design.views as ProductView[];

      setEditingTextId(null);
      setSelectedIds([]);
      setIsCapturingMockup(true);

      try {
        for (const view of views) {
          if (!stageRef.current) break;
          const vk = view.key;
          const url = await captureDesignOnlyImage(vk);
          if (url) {
            images[vk] = url;
            // Record where the garment sits on the 800×600 stage for this view so
            // the server extracts the correct region (studio image bounds, not
            // recomputed from the sampleMockup's aspect ratio).
            const sz = imageSizesByView[vk];
            if (sz && sz.width > 0 && sz.height > 0) {
              garmentBounds[vk] = { x: sz.x, y: sz.y, width: sz.width, height: sz.height };
            }
            console.log(`[captureDesignOnlyImagesAllViews] ✓ ${vk}:`, url, 'bounds:', garmentBounds[vk]);
          }
        }
      } catch (e) {
        console.error('[captureDesignOnlyImagesAllViews] error:', e);
      } finally {
        setIsCapturingMockup(false);
        toast.dismiss('design-capture-toast');
      }

      return { images, garmentBounds };
    },
    [product?.design?.views, captureDesignOnlyImage, imageSizesByView]
  );

  // Capture preview images for all views
  const captureAllViewPreviews = useCallback(async (): Promise<Record<string, string>> => {
    const previewsByView: Record<string, string> = {};
    const views = product?.design?.views || [];

    if (views.length === 0) {
      console.warn('No views available to capture');
      return previewsByView;
    }

    // Store original view to restore later
    const originalView = currentView;

    for (const view of views) {
      const viewKey = view.key;
      toast.info(`Capturing preview for ${viewKey} view...`);

      // Switch to this view
      setCurrentView(viewKey as any);

      // Wait for React + Konva to finish rendering the new view
      await new Promise(resolve => setTimeout(resolve, 800));

      // Additional frame wait to ensure canvas is fully rendered
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      // Capture the preview for this view
      const previewUrl = await capturePreviewImage(viewKey);

      if (previewUrl) {
        previewsByView[viewKey] = previewUrl;
        console.log(`Captured preview for ${viewKey}:`, previewUrl);
      } else {
        console.warn(`Failed to capture preview for ${viewKey} view`);
      }
    }

    // Restore original view
    setCurrentView(originalView as any);

    return previewsByView;
  }, [product?.design?.views, currentView, capturePreviewImage]);

  // Auto-save preview when entering Preview mode ONLY if design IMAGE changes (not color)
  useEffect(() => {
    if (!previewMode) return;

    const cacheKey = getPreviewCacheKey(currentView);
    const isDirtyForDesign = dirtyViewsForDesign.has(currentView);

    if (!isDirtyForDesign) return;

    // Clear dirty flag before the async work to prevent re-entry
    setDirtyViewsForDesign(prev => {
      const next = new Set(prev);
      next.delete(currentView);
      return next;
    });

    const run = async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const previewUrl = await capturePreviewImage(currentView);
      if (!previewUrl) return;

      setPreviewCache(prev => ({ ...prev, [cacheKey]: previewUrl }));
      setSavedPreviewImages(prev => ({ ...prev, [currentView]: previewUrl }));

      if (storeProductId) {
        try {
          await storeProductsApi.saveMockup(storeProductId, {
            mockupType: 'flat',
            viewKey: currentView,
            imageUrl: previewUrl,
          });
        } catch (err) {
          console.error('Failed to save flat mockup to backend:', err);
        }
      }
    };

    run();
  }, [previewMode, currentView, getPreviewCacheKey, dirtyViewsForDesign, capturePreviewImage, storeProductId, elements, designUrlsByPlaceholder]);

  // Auto-save flat mockups when design images are added (even in Edit mode)
  useEffect(() => {
    if (previewMode) return;
    if (dirtyViewsForDesign.size === 0) return;

    const hasImageElements = elements.some(el =>
      el.type === 'image' && (el.view === currentView || !el.view)
    );
    if (!hasImageElements) return;

    const run = async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const previewUrl = await capturePreviewImage(currentView);
      if (!previewUrl) return;

      setSavedPreviewImages(prev => ({ ...prev, [currentView]: previewUrl }));

      if (storeProductId) {
        try {
          await storeProductsApi.saveMockup(storeProductId, {
            mockupType: 'flat',
            viewKey: currentView,
            imageUrl: previewUrl,
          });
        } catch (err) {
          console.error('Error saving flat mockup after upload:', err);
        }
      }

      setDirtyViewsForDesign(prev => {
        const next = new Set(prev);
        next.delete(currentView);
        return next;
      });
    };

    run();
  }, [elements, currentView, storeProductId, dirtyViewsForDesign, previewMode, capturePreviewImage]);

  // ── Auto-save composed mockups for all dirty views ────────────────────────
  useEffect(() => {
    if (dirtyViewsForDesign.size === 0) return;
    if (!storeProductId) return;
    if (!product?.design?.views?.length) return;

    const views = product.design.views;
    const captureViewKeys = [...dirtyViewsForDesign];

    const run = async () => {
      if (isSavingMockupsRef.current || !stageRef.current) return;
      isSavingMockupsRef.current = true;

      const originalView = currentView;

      setSelectedIds([]);
      setIsCapturingMockup(true);

      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const mockupUrlsByView: Record<string, string> = {};

      for (const viewKey of captureViewKeys) {
        if (!views.find(v => v.key === viewKey)) continue;

        setCurrentView(viewKey as any);

        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        try {
          stageRef.current!.getLayers().forEach((l: any) => l.draw());

          const blob: Blob | null = await new Promise(resolve => {
            stageRef.current!.toBlob(
              (b: Blob | null) => resolve(b),
              { mimeType: 'image/png', pixelRatio: 2 }
            );
          });
          if (!blob) continue;

          const formData = new FormData();
          formData.append('image', blob, `mockup-${viewKey}.png`);

          const resp = await fetchWithApiAuth('/upload/image', {
            method: 'POST',
            headers: { 'ngrok-skip-browser-warning': 'true' },
            body: formData,
            credentials: 'include',
          });
          const json = await resp.json().catch(() => ({}));
          if (resp.ok && json?.success && json?.url) {
            mockupUrlsByView[viewKey] = json.url as string;
          }
        } catch (e) {
          console.error(`[autoSaveMockups] Error capturing "${viewKey}":`, e);
        }
      }

      setCurrentView(originalView as any);
      setIsCapturingMockup(false);

      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      if (Object.keys(mockupUrlsByView).length > 0) {
        const allPreviews = { ...savedMockupPreviews, ...mockupUrlsByView };
        setSavedMockupPreviews(allPreviews);

        try {
          await storeProductsApi.update(storeProductId, {
            designData: {
              elements,
              designUrlsByPlaceholder,
              placementsByView,
              views,
              previews: allPreviews,
              displacementSettings,
              selectedSizesByColor,
              primaryColorHex,
              selectedPrintMethodsByView,
            },
          });

          setDirtyViewsForDesign(prev => {
            const next = new Set(prev);
            Object.keys(mockupUrlsByView).forEach(k => next.delete(k));
            return next;
          });
        } catch (e) {
          console.error('[autoSaveMockups] Failed to update store product:', e);
        }
      }

      isSavingMockupsRef.current = false;
    };

    run();
  }, [
    dirtyViewsForDesign,
    storeProductId,
    product?.design?.views,
    currentView,
    elements,
    designUrlsByPlaceholder,
    placementsByView,
    savedPreviewImages,
    displacementSettings,
    selectedColors,
    selectedSizes,
    selectedSizesByColor,
    primaryColorHex,
    selectedPrintMethodsByView,
  ]);

  // Publish current product + design to the merchant's store
  const handlePublishToStore = useCallback(async () => {
    try {
      if (!user) {
        // Save current design state to sessionStorage for restoration after login
        if (id) {
          try {
            const designState = {
              elements,
              selectedColors,
              selectedSizes,
              selectedSizesByColor,
              currentView,
              designUrlsByPlaceholder,
              placementsByView,
              savedPreviewImages,
              displacementSettings,
              primaryColorHex,
              selectedPrintMethodsByView,
            };
            sessionStorage.setItem(`designer_state_${id}`, JSON.stringify(designState));
          } catch (err) {
            console.error('Failed to save design state:', err);
          }
        }

        // Redirect to auth page with return path
        navigate('/auth', {
          state: {
            from: {
              pathname: `/designer/${id}`,
            },
          },
        });
        return;
      }


      if (!['merchant', 'superadmin'].includes(user.role)) {
        toast.error('Only merchants or superadmins can publish');
        return;
      }
      if (!product) {
        toast.error('No product loaded');
        return;
      }

      // Ensure the merchant has at least one store before creating a draft
      try {
        const storesResp = await storeApi.listMyStores();
        const hasStore = storesResp?.success && Array.isArray(storesResp.data) && storesResp.data.length > 0;

        if (!hasStore) {
          try {
            const defaultData = generateDefaultStoreData();
            const createResp = await storeApi.create({
              name: defaultData.name,
              description: 'My first store'
            });
            if (createResp.success && createResp.data) {
              await refreshStores();
              const newStoreId = createResp.data.id || createResp.data._id;
              if (newStoreId) selectStoreById(newStoreId);
            }
            // toast.success('Default store created automatically.');
          } catch (err) {
            console.error('Failed to create default store:', err);
            // Persist current design state so it can be restored after creating a store
            if (id) {
              try {
                const designState = {
                  elements,
                  selectedColors,
                  selectedSizes,
                  selectedSizesByColor,
                  currentView,
                  designUrlsByPlaceholder,
                  placementsByView,
                  savedPreviewImages,
                  displacementSettings,
                  primaryColorHex,
                  selectedPrintMethodsByView,
                };
                sessionStorage.setItem(`designer_state_${id}`, JSON.stringify(designState));
              } catch (err) {
                console.error('Failed to save design state before navigating to stores:', err);
              }
            }

            toast.info('Please create a store to publish this product.');
            navigate('/stores', {
              state: {
                fromDesigner: {
                  pathname: `/designer/${id}`,
                },
              },
            });
            return;
          }
        }
      } catch (err) {
        console.error('Failed to check stores before publishing:', err);
        // If store check fails, continue to attempt draft creation;
        // backend will still enforce store existence.
      }

      setIsPublishing(true);

      // Define required variables from product and state
      const catalogProductId = product._id || product.id;
      const basePrice = product.catalogue?.basePrice || 0;
      const sellingPrice = basePrice > 0 ? parseFloat((basePrice / 0.6).toFixed(2)) : 0;
      const galleryImages = product.galleryImages || [];

      // Build design payload with current design state
      const designPayload = {
        views: product.design?.views || [],
        designUrlsByPlaceholder,
        placementsByView, // Include normalized placements
        elements: elements.map(el => ({
          ...el,
          // Include only serializable properties
        })),
        savedPreviewImages,
        displacementSettings,
        selectedPrintMethodsByView,
        totalPrintCost: 0,
      };

      // Build variants from selected colors and sizes
      const listingVariants: Array<{ color: string; size: string; price: number }> = [];
      selectedColors.forEach(color => {
        const sizesForColor = selectedSizesByColor[color] || selectedSizes;
        sizesForColor.forEach(size => {
          listingVariants.push({
            color,
            size,
            price: sellingPrice,
          });
        });
      });

      // --- VARIANT VALIDATION ---
      if (!variantValidation.isValid) {
        toast.error(variantValidation.message);
        setIsPublishing(false);
        return;
      }

      if (!printMethodValidation.isValid) {
        toast.error(printMethodValidation.message);
        setIsPublishing(false);
        return;
      }

      // --- DPI VALIDATION ---
      // Removed DPI validation as requested to allow images below 300 DPI.
      /*
      if (Object.keys(lowDpiImages).length > 0) {
        const lowestDpi = Math.min(...Object.values(lowDpiImages));
        toast.error(`Cannot add product: image resolution is too low (${lowestDpi} DPI). Please upload an image with at least 300 DPI.`);
        return;
      }
      */

      // --- COMPUTE TOTAL PRINT COST ---
      const computeMethodCost = (method: any, area: number): number => {
        const areaCharge = (method.baseRatePaisePerSqIn ?? 0) * area;
        const extraColors = method.hasColors ? Math.max(0, 1 - (method.minColors ?? 1)) : 0;
        const colorCharge = method.hasColors ? ((method.colorRatePaise ?? 0) * extraColors) : 0;
        return Math.round(areaCharge + colorCharge) / 100;
      };

      let totalPrintCost = 0;
      const allowedPrintMethods = ((product.allowedPrintMethodIds as any[]) ?? []);
      for (const [viewKey, methodId] of Object.entries(selectedPrintMethodsByView)) {
        if (!methodId) continue;
        const method = allowedPrintMethods.find((candidate: any) => {
          if (typeof candidate === 'string') return candidate === methodId;
          return candidate?._id === methodId || candidate?.id === methodId;
        });
        if (!method || typeof method === 'string') continue;

        const actualArea = designAreaByView[viewKey] ?? 0;
        const placeholderArea = (product.design?.views ?? [])
          .find((view: any) => view.key === viewKey)
          ?.placeholders?.reduce((sum: number, placeholder: any) => {
            return sum + ((placeholder.widthIn ?? 0) * (placeholder.heightIn ?? 0));
          }, 0) ?? 0;
        const area = actualArea > 0 ? actualArea : placeholderArea;
        totalPrintCost += computeMethodCost(method, area);
      }
      designPayload.totalPrintCost = totalPrintCost;

      // --- CREATE DRAFT IN DATABASE ---
      // Create a draft store product with the entire elements array
      const draftPayload = {
        _id: storeProductId,
        catalogProductId,
        sellingPrice,
        status: 'draft' as const,
        designData: {
          elements: elements, // Save entire elements array (do not rename fields)
          designUrlsByPlaceholder,
          placementsByView, // Include normalized placements for accurate mockup rendering
          views: product.design?.views || [],
          displacementSettings,
          selectedColors,
          selectedSizes,
          selectedSizesByColor, // Save size selections per color
          primaryColorHex, // Save primary color for garment tinting
          selectedPrintMethodsByView,
          totalPrintCost,
        },
        // Optional: include basic product info if available
        title: product?.catalogue?.name,
      };

      const draftResponse = await storeProductsApi.create(draftPayload);
      if (!draftResponse || !draftResponse.success) {
        toast.error('Failed to create draft: ' + (draftResponse?.message || 'Unknown error'));
        return;
      }

      const draftId = draftResponse.data?.storeProduct?._id || draftResponse.data?._id;
      if (!draftId) {
        toast.error('Failed to get draft ID from server response');
        return;
      }

      console.log('Draft created with storeProductId:', draftId);
      setStoreProductId(draftId);

      // --- NEW MOCKUP GENERATION FLOW ---

      // Step 1: Capture all views BEFORE navigate() while stage is still mounted.
      // The offscreen canvas approach reads elements state directly — no Konva wait needed.
      toast.loading('Preparing mockup previews…', { id: 'design-capture-toast' });
      const { images: capturedDesignImages, garmentBounds: capturedGarmentBounds } =
        await captureDesignOnlyImagesAllViews();
      toast.dismiss('design-capture-toast');

      // Step 2: Persist to DB so MockupsLibrary can reuse on regeneration.
      if (Object.keys(capturedDesignImages).length > 0) {
        try {
          await storeProductsApi.update(draftId, {
            designData: {
              designOnlyImages: capturedDesignImages,
              garmentBoundsByView: capturedGarmentBounds,
              
            },
          });
          console.log('[handlePublishToStore] designOnlyImages + garmentBounds saved to DB');
        } catch (e) {
          console.warn('[handlePublishToStore] Failed to save designOnlyImages:', e);
        }

        // Step 3: Fire server generation as true fire-and-forget — canvas not needed.
        fetchWithApiAuth(`/storeproducts/${draftId}/generate-mockups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          credentials: 'include',
          body: JSON.stringify({
            designOnlyImages: capturedDesignImages,
            garmentBoundsByView: capturedGarmentBounds,
          }),
        })
          .then(r => r.json().catch(() => ({})))
          .then(data => {
            if (data?.success) {
              console.log('[generate-mockups] Done:', Object.keys(data.modelMockups || {}));
            } else {
              console.warn('[generate-mockups] Server errors:', data?.errors || data?.message);
            }
          })
          .catch(e => console.error('[generate-mockups] background failed:', e));
      }

      toast.info('Opening mockups — previews will generate in the background.');

      // Helper to save state for restoration when coming back from Mockups/Listing
      const saveStateForReturn = () => {
        if (!catalogProductId) return;
        try {
          const designState = {
            elements,
            selectedColors,
            selectedSizes,
            selectedSizesByColor,
            currentView,
            designUrlsByPlaceholder,
            placementsByView,
            savedPreviewImages,
            displacementSettings,
            primaryColorHex,
            selectedPrintMethodsByView,
          };
          sessionStorage.setItem(`designer_state_${catalogProductId}`, JSON.stringify(designState));
          console.log('Saved design state to sessionStorage for:', catalogProductId);
        } catch (err) {
          console.error('Failed to save design state for return:', err);
        }
      };

      // Check if product has sample mockups
      const sampleMockups = (product.design as any)?.sampleMockups || [];
      const hasSampleMockups = sampleMockups.length > 0;
      console.log('Mockup Generation Init:', { hasSampleMockups, count: sampleMockups.length, selectedColors });

      // --- VERIFICATION GATE (POST-DRAFT) ---
      if (!user.isEmailVerified || !user.isPhoneVerified) {
        saveStateForReturn();
        const targetPath = hasSampleMockups ? '/mockups-library' : '/listing-editor';
        const targetState = {
          storeProductId: draftId,
          productId: catalogProductId,
          baseSellingPrice: sellingPrice,
          title: product?.catalogue?.name,
          galleryImages,
          designData: designPayload,
          variants: listingVariants,
          sampleMockups: hasSampleMockups ? sampleMockups : undefined,
          displacementSettings: product.design?.displacementSettings
        };

        if (!user.isEmailVerified && !user.isPhoneVerified) {
          toast.info('Please verify your email and phone to continue.');
          navigate('/verify-email?source=add-product', {
            state: {
              returnTo: targetPath,
              returnToState: targetState,
              nextVerification: 'phone',
              triggerPublish: true,
              from: 'add-product'
            }
          });
        } else if (!user.isEmailVerified) {
          toast.info('Please verify your email to continue.');
          navigate('/verify-email?source=add-product', {
            state: {
              returnTo: targetPath,
              returnToState: targetState,
              triggerPublish: true,
              from: 'add-product'
            }
          });
        } else {
          toast.info('Please verify your phone number to continue.');
          navigate('/verify-phone?source=add-product', {
            state: {
              returnTo: targetPath,
              returnToState: targetState,
              triggerPublish: true,
              from: 'add-product'
            }
          });
        }
        return;
      }

      // Navigate to MockupsLibrary if sample mockups exist
      if (hasSampleMockups) {
        saveStateForReturn();
        navigate('/mockups-library', {
          state: {
            storeProductId: draftId, // Pass the draft ID
            productId: catalogProductId,
            baseSellingPrice: sellingPrice,
            title: product?.catalogue?.name,
            galleryImages,
            designData: designPayload,
            variants: listingVariants,
            // Pass minimal data needed for composition
            sampleMockups,
            displacementSettings: product.design?.displacementSettings
          }
        });
      } else {
        // Fallback to legacy behavior if no sample mockups
        saveStateForReturn();
        toast.success('Design ready. Continue in Listing editor to finish publishing.');
        navigate('/listing-editor', {
          state: {
            storeProductId: draftId, // Pass the draft ID
            productId: catalogProductId,
            baseSellingPrice: sellingPrice,
            title: product?.catalogue?.name,
            galleryImages,
            designData: designPayload,
            variants: listingVariants,
          },
        });
      }

    } catch (e: any) {
      console.error('Publish error:', e);
      toast.error(e?.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  }, [user, product, elements, currentView, selectedColors, selectedSizes, selectedSizesByColor, placeholders, PX_PER_INCH, stageSize, canvasPadding, navigate, savedPreviewImages, designUrlsByPlaceholder, placementsByView, displacementSettings, storeProductId, captureDesignOnlyImagesAllViews]);

  const handleSave = async () => {
    if (!stageRef.current || !id) {
      toast.error('Canvas is not ready to save');
      return;
    }

    // Helper: upload a blob to S3 and return the URL
    const uploadBlob = async (blob: Blob, filename: string): Promise<string | null> => {
      const formData = new FormData();
      formData.append('image', blob, filename);
      try {
        const resp = await fetchWithApiAuth('/upload/image', {
          method: 'POST',
          headers: { 'ngrok-skip-browser-warning': 'true' },
          body: formData,
          credentials: 'include',
        });
        const json = await resp.json().catch(() => ({}));
        return (resp.ok && json?.success && json?.url) ? json.url as string : null;
      } catch {
        return null;
      }
    };

    // Helper: capture the current Konva stage as a blob (no UI artifacts).
    // Forces a synchronous layer flush first so the design-elements layer
    // is fully painted regardless of react-konva's batchDraw timing.
    const captureStageBlob = (): Promise<Blob | null> => {
      stageRef.current!.getLayers().forEach((l: any) => l.draw());
      return new Promise((resolve) => {
        stageRef.current!.toBlob(
          (blob) => resolve(blob),
          { mimeType: 'image/png', pixelRatio: 2 }
        );
      });
    };

    try {
      // ── 1. Save the current-view preview (existing behaviour) ──────────────

      // Two rAFs so Konva has committed the latest render to the canvas
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const currentViewBlob = await captureStageBlob();
      if (!currentViewBlob) {
        toast.error('Failed to generate preview image');
        return;
      }

      const uploadedUrl = await uploadBlob(currentViewBlob, `preview-${currentView}.png`);
      if (!uploadedUrl) {
        toast.error('Failed to upload preview image');
        return;
      }

      const nextPreviewImages = { ...savedPreviewImages, [currentView]: uploadedUrl } as Record<string, string>;
      setSavedPreviewImages(nextPreviewImages);

      const saveResp = await fetchWithApiAuth(`/auth/me/previews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
        body: JSON.stringify({ previews: { [currentView]: uploadedUrl } }),
      });
      const saveJson = await saveResp.json().catch(() => ({}));
      if (saveResp.ok && saveJson?.success) {
        toast.custom((_t) => (
          <div className="flex items-center gap-3 bg-background border border-border rounded-lg shadow-lg p-3 w-full max-w-sm pointer-events-auto">
            <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-muted border border-border">
              <img src={uploadedUrl} alt="Saved preview" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Preview Saved</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate capitalize flex-1">{currentView} view updated</p>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  View <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ), { duration: 3000 });

        setHasUnsavedChanges(false);

        const cacheKey = getPreviewCacheKey(currentView);
        setPreviewCache(prev => ({ ...prev, [cacheKey]: uploadedUrl }));
        setSavedPreviewImages(nextPreviewImages);
      } else {
        toast.error('Uploaded image, but failed to save to user previews');
      }

      // ── 1b. Immediately persist current-view preview to designData.previews ──
      const nextMockupPreviews = { ...savedMockupPreviews, [currentView]: uploadedUrl } as Record<string, string>;
      setSavedMockupPreviews(nextMockupPreviews);

      if (storeProductId) {
        try {
          await storeProductsApi.update(storeProductId, {
            designData: {
              elements,
              designUrlsByPlaceholder,
              placementsByView,
              views: product?.design?.views || [],
              previews: nextMockupPreviews,
              displacementSettings,
              selectedSizesByColor,
              primaryColorHex,
              selectedPrintMethodsByView,
            },
          });
          console.log(`[handleSave] Saved preview to designData.previews for "${currentView}":`, uploadedUrl);
        } catch (e) {
          console.warn('[handleSave] Failed to persist designData.previews:', e);
        }
      }

      // ── 2. Capture composed mockup for every view → designData.views ──────
      if (!storeProductId || !product?.design?.views?.length) return;

      // Prevent concurrent mockup capture (e.g. auto-save firing at the same time)
      if (isSavingMockupsRef.current) return;
      isSavingMockupsRef.current = true;

      const views = product.design.views;
      const originalView = currentView;

      // Suppress UI chrome (grid, rulers, placeholder outlines, transformer, selection box)
      // without changing previewMode so no other effects are triggered
      setSelectedIds([]);
      setIsCapturingMockup(true);

      // Let React flush those state changes before the loop
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const mockupUrlsByView: Record<string, string> = {};

      for (const view of views) {
        const viewKey = view.key;

        // Switch to this view so garment + design elements update
        setCurrentView(viewKey as any);

        // Wait for React to commit → react-konva to update nodes → Konva to
        // run its batchDraw.  600 ms covers slow S3 garment fetches; the three
        // rAFs give batchDraw at least two full frames to fire before our
        // explicit layer.draw() flush inside captureStageBlob.
        await new Promise(resolve => setTimeout(resolve, 600));
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        try {
          const blob = await captureStageBlob();
          if (!blob) {
            console.error(`[handleSave] captureStageBlob returned null for view "${viewKey}"`);
            continue;
          }
          const url = await uploadBlob(blob, `mockup-${viewKey}.png`);
          if (url) {
            mockupUrlsByView[viewKey] = url;
            console.log(`[handleSave] Composed mockup uploaded for "${viewKey}":`, url);
          } else {
            console.error(`[handleSave] Upload failed for view "${viewKey}"`);
          }
        } catch (e) {
          console.error(`[handleSave] Error capturing view "${viewKey}":`, e);
        }
      }

      // Restore original view and UI state
      setCurrentView(originalView as any);
      setIsCapturingMockup(false);

      // Wait for the view restore to settle
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      // ── 3. Persist all-view previews to designData.previews ──────────────────
      if (Object.keys(mockupUrlsByView).length > 0) {
        const allPreviews = { ...savedMockupPreviews, ...mockupUrlsByView };
        setSavedMockupPreviews(allPreviews);

        try {
          await storeProductsApi.update(storeProductId, {
            designData: {
              elements,
              designUrlsByPlaceholder,
              placementsByView,
              views: views,
              previews: allPreviews,
              displacementSettings,
              selectedSizesByColor,
              primaryColorHex,
              selectedPrintMethodsByView,
            },
          });
          console.log('[handleSave] designData.previews saved:', allPreviews);
        } catch (e) {
          console.error('[handleSave] Failed to save designData.previews:', e);
        }
      }

      isSavingMockupsRef.current = false;
    } catch (e) {
      console.error('Save error:', e);
      toast.error('Failed to save');
    }
  };

  const handleViewSwitch = (viewKey: string) => {
    // Log view switch for debugging
    console.log('[DesignEditor] View switch:', {
      from: currentView,
      to: viewKey,
      previewMode,
      primaryColorHex,
      elementsCount: elements.length,
      elementsForNewView: elements.filter(e => e.view === viewKey || !e.view).length,
      designUrlsForNewView: Object.keys(designUrlsByPlaceholder[viewKey] || {}).length,
    });

    // Explicitly preserve previewMode when switching views
    const currentPreviewMode = previewModeRef.current;
    setCurrentView(viewKey as any);
    // Restore previewMode after view change to ensure it persists
    if (currentPreviewMode !== previewMode) {
      setPreviewMode(currentPreviewMode);
    }
    // Clear selected placeholder when switching views
    setSelectedPlaceholderId(null);
    selectedPlaceholderIdRef.current = null;
    setSelectedIds([]);
  };

  const isPreviewButtonDisabled = isPreviewTemporarilyDisabled;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden selection:bg-primary/20 no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 15px 2px rgba(var(--primary), 0.3); }
          50% { box-shadow: 0 0 25px 5px rgba(var(--primary), 0.5); }
        }

        .cta-pulse {
          position: relative;
        }

        .cta-pulse::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: hsl(var(--primary));
          border-radius: 50%;
          z-index: -1;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .stop-pulse::before {
          animation: none;
          display: none;
        }
      `}</style>
      {/* Top Bar */}
      <div className="h-[60px] border-b flex items-center justify-between px-4 bg-background z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-accent">
            {isMobile ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
          {!isMobile && (
            <>
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="ghost" size="icon" onClick={undo} disabled={undoStack.length === 0}>
                <Undo2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={redo} disabled={redoStack.length === 0}>
                <Redo2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* {!isMobile && catalogAllowedPrintMethods.length > 1 && (
            <Select
              value={printMethod}
              onValueChange={(v) => setPrintMethod(v as PrintMethodId)}
            >
              <SelectTrigger className="h-8 w-[148px] text-xs font-medium">
                <SelectValue placeholder="Print method" />
              </SelectTrigger>
              <SelectContent>
                {catalogAllowedPrintMethods.map((id) => (
                  <SelectItem key={id} value={id}>
                    {PRINT_METHOD_DEFINITIONS.find((d) => d.id === id)?.label ?? id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
            <Button
              variant={!previewMode ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setPreviewMode(false);
              }}
              className="h-8 rounded-md text-xs font-medium"
            >
              Edit
            </Button>
            <Button
              variant={previewMode ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!isPreviewButtonDisabled) {
                  setPreviewMode(true);
                }
              }}
              disabled={isPreviewButtonDisabled}
              className="h-8 rounded-md text-xs font-medium"
            >
              Preview
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile ? (
            <>
              {/* <Button variant="outline" size="sm" onClick={handleSave} className="hidden sm:flex">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleExportPreview('png')}>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline ml-1">Export</span>
              </Button> */}
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handlePublishToStore}
              disabled={isPublishing}
              className={`rounded-full h-9 px-4 font-semibold text-xs shadow-sm shadow-primary/20 ${(!variantValidation.isValid || !printMethodValidation.isValid) ? 'opacity-50 grayscale' : ''}`}
            >
              {isPublishing ? '...' : 'Add Product'}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Views Selector Hub (Top) */}
      {isMobile && !previewMode && availableViews.length > 0 && (
        <div className="flex-shrink-0 border-b bg-white flex justify-center z-10 w-full overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 p-2 overflow-x-auto no-scrollbar px-4 justify-start sm:justify-center min-w-full py-3">
            <div className="flex gap-2 bg-slate-100/50 p-1 rounded-xl">
              {availableViews.map((viewKey) => {
                const isActive = currentView === viewKey;
                return (
                  <button
                    key={viewKey}
                    onClick={() => handleViewSwitch(viewKey)}
                    className={`px-5 py-1.5 transition-all duration-200 font-bold text-[12px] whitespace-nowrap rounded-lg ${isActive
                      ? 'bg-[#22c55e] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#22c55e]'
                      }`}
                  >
                    {viewKey.charAt(0).toUpperCase() + viewKey.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop Only (hidden in preview mode) */}
        {!isMobile && !previewMode && (
          <aside className="w-[80px] border-r flex flex-col">
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {tools.map((tool) => (
                  <Button
                    key={tool.label}
                    variant={activeTool === tool.toolKey ? 'default' : 'outline'}
                    onClick={tool.onClick}
                    className="h-16 w-20 rounded-none border-none flex flex-col items-center justify-center gap-1.5"
                    title={tool.label}
                  >
                    <tool.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[10px] font-medium leading-none">{tool.label}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Mobile Tools Panel (Drawer based) */}
        {isMobile && !previewMode && (
          <Drawer
            open={isMobileMenuOpen}
            onOpenChange={setIsMobileMenuOpen}
            modal={false}
            snapPoints={[0.97]}
          >
            <DrawerContent className="h-[80vh] flex flex-col" showOverlay={false}>
              <DrawerHeader className="text-left border-b pb-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle>
                    {mobileToolStage === 'menu' ? 'Add design' : activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <X className="w-5 h-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              {mobileToolStage === 'menu' ? (
                <div className="flex-1 overflow-y-auto p-6 bg-muted/5 min-h-0">
                  <div className="grid grid-cols-2 gap-4">
                    {tools.map((tool) => (
                      <button
                        key={tool.label}
                        onClick={() => {
                          tool.onClick();
                          setMobileToolStage('detail');
                        }}
                        className="flex flex-col items-center justify-center gap-4 bg-background p-8 rounded-2xl shadow-sm border border-border/50 transition-all active:scale-95 group hover:border-primary/30"
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-active:bg-primary/20 transition-colors">
                          <tool.icon className="w-8 h-8 text-primary" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-foreground">{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden">
                  <div className="border-b bg-muted/5 overflow-x-auto no-scrollbar flex-shrink-0">
                    <div className="flex items-center p-3 gap-3 min-w-max px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileToolStage('menu')}
                        className="rounded-full gap-1 h-8 px-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </Button>
                      {tools.map((tool) => (
                        <button
                          key={tool.label}
                          onClick={tool.onClick}
                          className={`px-5 py-2 rounded-full text-[11px] font-bold transition-all whitespace-nowrap shadow-sm border ${activeTool === tool.toolKey
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:bg-accent'
                            }`}
                        >
                          {tool.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Suspense fallback={<PanelFallback />}>
                    <div className="flex-1 overflow-hidden h-full flex flex-col">
                      {activeTool === 'upload' && (
                        <UploadPanel
                          onFileUpload={handleFileUpload}
                          onUploadClick={() => document.getElementById('file-upload')?.click()}
                          imagePreview={uploadedImagePreview}
                          onImageClick={addImageToCanvas}
                          selectedPlaceholderId={selectedPlaceholderId}
                          selectedPlaceholderName={selectedPlaceholderId ? placeholders.find(p => p.id === selectedPlaceholderId)?.original?.name || null : null}
                          placeholders={placeholders.map(p => ({
                            id: p.id,
                            x: p.x,
                            y: p.y,
                            width: p.width,
                            height: p.height,
                            rotation: p.rotation,
                          }))}
                          onBgRemoverClick={handleBgRemoverAction}
                        />
                      )}
                      {activeTool === 'text' && (
                        <TextPanel
                          onAddText={(text, font) => handleAddTextWithParams(text, font)}
                          onClose={() => setIsMobileMenuOpen(false)}
                        />
                      )}
                      {(() => {
                        const selectedPlaceholderName = selectedPlaceholderId
                          ? placeholders.find(p => p.id === selectedPlaceholderId)?.original?.name || null
                          : null;
                        return (
                          <>
                            {activeTool === 'shapes' && (
                              <ShapesPanel
                                onAddShape={handleAddShape}
                                onAddAsset={addImageToCanvas}
                                selectedPlaceholderId={selectedPlaceholderId}
                                selectedPlaceholderName={selectedPlaceholderName}
                                placeholders={placeholders}
                                isMobile={true}
                              />
                            )}
                            {activeTool === 'library' && (
                              <LibraryPanel
                                onAddAsset={addImageToCanvas}
                                selectedPlaceholderId={selectedPlaceholderId}
                                selectedPlaceholderName={selectedPlaceholderName}
                                placeholders={placeholders}
                                isMobile={true}
                              />
                            )}
                            {activeTool === 'graphics' && (
                              <GraphicsPanel
                                onAddAsset={addImageToCanvas}
                                selectedPlaceholderId={selectedPlaceholderId}
                                selectedPlaceholderName={selectedPlaceholderName}
                                placeholders={placeholders}
                                isMobile={true}
                              />
                            )}
                            {activeTool === 'patterns' && (
                              <AssetPanel
                                onAddAsset={addImageToCanvas}
                                category="patterns"
                                title="Patterns"
                                selectedPlaceholderId={selectedPlaceholderId}
                                selectedPlaceholderName={selectedPlaceholderName}
                                placeholders={placeholders}
                                isMobile={true}
                              />
                            )}
                            {activeTool === 'logos' && (
                              <LogosPanel
                                onAddAsset={addImageToCanvas}
                                selectedPlaceholderId={selectedPlaceholderId}
                                selectedPlaceholderName={selectedPlaceholderName}
                                placeholders={placeholders}
                                isMobile={true}
                              />
                            )}
                          </>
                        );
                      })()}
                      {activeTool === 'templates' && <TemplatesPanel isMobile={true} />}
                      {activeTool === 'ai' && (
                        <AIimageGen
                          onImageClick={addImageToCanvas}
                          selectedPlaceholderId={selectedPlaceholderId}
                          onClose={() => setIsMobileMenuOpen(false)}
                          onBgRemoverClick={handleBgRemoverAction}
                        />
                      )}

                    </div>
                  </Suspense>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        )}

        {/* Left Panel - Desktop Only (hidden in preview mode) */}
        {!isMobile && !previewMode && showLeftPanel && (
          <div className="w-[250px] border-r bg-background flex flex-col">
            <ScrollArea className="flex-1">
              <Suspense fallback={<PanelFallback />}>
                {activeTool === 'upload' && (
                  <UploadPanel
                    onFileUpload={handleFileUpload}
                    onUploadClick={() => document.getElementById('file-upload')?.click()}
                    imagePreview={uploadedImagePreview}
                    // Add uploaded images to canvas like other asset panels
                    onImageClick={addImageToCanvas}
                    selectedPlaceholderId={selectedPlaceholderId}
                    selectedPlaceholderName={selectedPlaceholderId ? placeholders.find(p => p.id === selectedPlaceholderId)?.original?.name || null : null}
                    placeholders={placeholders.map(p => ({
                      id: p.id,
                      x: p.x,
                      y: p.y,
                      width: p.width,
                      height: p.height,
                      rotation: p.rotation,
                    }))}
                    onBgRemoverClick={handleBgRemoverAction}
                  />
                )}
                {activeTool === 'text' && (
                  <TextPanel
                    onAddText={(text, font) => {
                      handleAddTextWithParams(text, font);
                    }}
                    onClose={() => setShowLeftPanel(false)}
                  />
                )}
                {activeTool === 'ai' && (
                  <AIimageGen
                    onImageClick={addImageToCanvas}
                    selectedPlaceholderId={selectedPlaceholderId}
                    onClose={() => setShowLeftPanel(false)}
                    onBgRemoverClick={handleBgRemoverAction}
                  />
                )}

                {(() => {
                  const selectedPlaceholderName = selectedPlaceholderId
                    ? placeholders.find(p => p.id === selectedPlaceholderId)?.original?.name || null
                    : null;
                  return (
                    <>
                      {activeTool === 'shapes' && (
                        <ShapesPanel
                          onAddShape={handleAddShape}
                          onAddAsset={addImageToCanvas}
                          selectedPlaceholderId={selectedPlaceholderId}
                          selectedPlaceholderName={selectedPlaceholderName}
                          placeholders={placeholders}
                        />
                      )}
                      {activeTool === 'library' && (
                        <LibraryPanel
                          onAddAsset={addImageToCanvas}
                          selectedPlaceholderId={selectedPlaceholderId}
                          selectedPlaceholderName={selectedPlaceholderName}
                          placeholders={placeholders}
                        />
                      )}
                      {activeTool === 'graphics' && (
                        <GraphicsPanel
                          onAddAsset={addImageToCanvas}
                          selectedPlaceholderId={selectedPlaceholderId}
                          selectedPlaceholderName={selectedPlaceholderName}
                          placeholders={placeholders}
                        />
                      )}
                      {activeTool === 'patterns' && (
                        <AssetPanel
                          onAddAsset={addImageToCanvas}
                          category="patterns"
                          title="Patterns"
                          selectedPlaceholderId={selectedPlaceholderId}
                          selectedPlaceholderName={selectedPlaceholderName}
                          placeholders={placeholders}
                        />
                      )}
                      {activeTool === 'logos' && (
                        <LogosPanel
                          onAddAsset={addImageToCanvas}
                          selectedPlaceholderId={selectedPlaceholderId}
                          selectedPlaceholderName={selectedPlaceholderName}
                          placeholders={placeholders}
                        />
                      )}
                    </>
                  );
                })()}
                {activeTool === 'templates' && (
                  <TemplatesPanel />
                )}
              </Suspense>
            </ScrollArea>
          </div>
        )}

        {/* Main Canvas Area */}
        <div
          className="flex-1 min-h-0 flex flex-col items-center bg-muted/30 relative overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoadingProduct ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading product...</p>
              </div>
            </div>
          ) : currentViewData ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* DPI Warning Banner — shown when any uploaded image is below 300 DPI */}
              {/* <DpiWarningPanel lowDpiImages={lowDpiImages} /> */}

              <div
                ref={canvasContainerRef}
                className="relative bg-white shadow-lg overflow-hidden flex-shrink-0"
                style={{
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                  transform: `translate(${stagePos.x}px, ${stagePos.y}px) scale(${zoom / 100})`,
                  transformOrigin: 'center',
                }}
              >
                {/* Dynamic Floating DPI Indicator for Selected Image */}
                {/* {(() => {
                  if (selectedDpiResult && selectedIds.length === 1 && !previewMode) {
                    const selectedEl = elements.find(el => el.id === selectedIds[0]);
                    if (selectedEl && selectedEl.type === 'image') {
                      // Anchor to the center-top of the image element in Stage coordinates.
                      // Offset is handled by the DpiIndicator component's internal transform.
                      const x = selectedEl.x + (selectedEl.width || 0) / 2;
                      const y = selectedEl.y;

                      return (
                        <DpiIndicator
                          dpi={selectedDpiResult.effectiveDPI}
                          quality={selectedDpiResult.qualityStatus}
                          isStretched={selectedDpiResult.isStretched}
                          x={x}
                          y={y}
                        />
                      );
                    }
                  }
                  return null;
                })()} */}

                {/* Konva canvas — edit and preview share the same stage */}
                <div
                  className="absolute inset-0 pointer-events-auto"
                >
                  <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={!previewMode ? ((e: any) => {
                      const isBackground = e.target === e.target.getStage() || e.target.attrs.isPlaceholder || e.target.getType() === 'Layer';

                      if (activeTool === 'select') {
                        const pos = e.target.getStage().getRelativePointerPosition();
                        // Marquee selection starts if we hit the background, a placeholder, or something that's not a design element
                        const targetType = e.target.attrs.type;
                        const isDesignElement = targetType === 'image' || targetType === 'text' || targetType === 'shape';

                        if (isBackground || !isDesignElement) {
                          selectionStartPos.current = pos;
                          setSelectionBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, active: true });

                          // For multi-selection support
                          if (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey) {
                            initialSelectedIdsRef.current = [...selectedIds];
                          } else {
                            initialSelectedIdsRef.current = [];
                            setSelectedIds([]);
                          }
                        }

                        if (isBackground) {
                          if (!e.evt.shiftKey && !e.evt.ctrlKey && !e.evt.metaKey) {
                            setSelectedIds([]);
                          }
                          if (isMobile) {
                            setShowRightPanel(false);
                            setIsMobileMenuOpen(false);
                          }
                        }
                      } else if (isBackground) {
                        setSelectedIds([]);
                      }
                    }) : undefined}
                    onMouseMove={!previewMode ? ((e: any) => {
                      if (!selectionBox || !selectionBox.active) return;
                      const stage = e.target.getStage();
                      const pos = stage.getRelativePointerPosition();

                      const newX1 = selectionBox.x1;
                      const newY1 = selectionBox.y1;
                      const newX2 = pos.x;
                      const newY2 = pos.y;

                      setSelectionBox(prev => prev ? { ...prev, x2: newX2, y2: newY2 } : null);

                      // Real-time highlight logic
                      const rect = {
                        minX: Math.min(newX1, newX2),
                        maxX: Math.max(newX1, newX2),
                        minY: Math.min(newY1, newY2),
                        maxY: Math.max(newY1, newY2)
                      };

                      const intersectedIds: string[] = [];
                      elements.forEach(el => {
                        if ((el.view && el.view !== currentView) || el.visible === false) return;

                        const elBounds = calculateRotatedBounds(el.x, el.y, el.width || 0, el.height || 0, el.rotation || 0);

                        // Intersection check
                        if (!(elBounds.minX > rect.maxX ||
                          elBounds.maxX < rect.minX ||
                          elBounds.minY > rect.maxY ||
                          elBounds.maxY < rect.minY)) {
                          intersectedIds.push(el.id);
                        }
                      });

                      // Combine with initial selection if modifier is held
                      if (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey) {
                        const combined = [...new Set([...initialSelectedIdsRef.current, ...intersectedIds])];
                        // Only update if changed to avoid unnecessary re-renders
                        if (combined.length !== selectedIds.length || !combined.every(id => selectedIds.includes(id))) {
                          setSelectedIds(combined);
                        }
                      } else {
                        if (intersectedIds.length !== selectedIds.length || !intersectedIds.every(id => selectedIds.includes(id))) {
                          setSelectedIds(intersectedIds);
                        }
                      }
                    }) : undefined}
                    onMouseUp={!previewMode ? ((e: any) => {
                      if (!selectionBox || !selectionBox.active) return;

                      // Final selection check is already handled by onMouseMove
                      // But we open the panel on desktop if selection is non-empty
                      if (selectedIds.length > 0 && !isMobile) {
                        setRightPanelTab('properties');
                      }

                      setSelectionBox(null);
                      initialSelectedIdsRef.current = [];
                    }) : undefined}
                    onTouchStart={!previewMode ? ((e: any) => {
                      const isBackground = e.target === e.target.getStage() || e.target.attrs.isPlaceholder || e.target.getType() === 'Layer';

                      if (activeTool === 'select' && e.evt.touches.length === 1) {
                        const pos = e.target.getStage().getRelativePointerPosition();
                        const targetType = e.target.attrs.type;
                        const isDesignElement = targetType === 'image' || targetType === 'text' || targetType === 'shape';

                        if (isBackground || !isDesignElement) {
                          selectionStartPos.current = pos;
                          setSelectionBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, active: true });
                        }

                        if (isBackground) {
                          setSelectedIds([]);
                          if (isMobile) {
                            setShowRightPanel(false);
                            setIsMobileMenuOpen(false);
                          }
                        }
                      } else if (isBackground) {
                        setSelectedIds([]);
                        if (isMobile) {
                          setShowRightPanel(false);
                          setIsMobileMenuOpen(false);
                        }
                      }
                    }) : undefined}
                    onTouchMove={!previewMode ? ((e: any) => {
                      if (!selectionBox || !selectionBox.active || e.evt.touches.length > 1) {
                        if (selectionBox) setSelectionBox(null);
                        return;
                      }
                      const stage = e.target.getStage();
                      const pos = stage.getRelativePointerPosition();
                      setSelectionBox(prev => prev ? { ...prev, x2: pos.x, y2: pos.y } : null);
                    }) : undefined}
                    onTouchEnd={!previewMode ? (() => {
                      if (!selectionBox || !selectionBox.active) return;

                      const rect = {
                        minX: Math.min(selectionBox.x1, selectionBox.x2),
                        maxX: Math.max(selectionBox.x1, selectionBox.x2),
                        minY: Math.min(selectionBox.y1, selectionBox.y2),
                        maxY: Math.max(selectionBox.y1, selectionBox.y2)
                      };

                      const newlySelectedIds: string[] = [];
                      elements.forEach(el => {
                        if (el.view !== currentView || el.visible === false) return;
                        const elBounds = calculateRotatedBounds(el.x, el.y, el.width || 0, el.height || 0, el.rotation || 0);

                        if (!(elBounds.minX > rect.maxX ||
                          elBounds.maxX < rect.minX ||
                          elBounds.minY > rect.maxY ||
                          elBounds.maxY < rect.minY)) {
                          newlySelectedIds.push(el.id);
                        }
                      });

                      if (newlySelectedIds.length > 0) {
                        setSelectedIds(newlySelectedIds);
                      }

                      setSelectionBox(null);
                    }) : undefined}
                  >
                    {/* Garment mockup background */}
                    <Layer listening={false}>
                      {mockupImage && imageSize.width > 0 && imageSize.height > 0 && (
                        <Image
                          image={
                            // When a colour is selected, pixel-tint the base product image
                            // so the garment silhouette changes colour.
                            // tintGarmentImage() skips transparent/background pixels and
                            // caches the result, so it's fast after the first render.
                            (primaryColorHex && _primaryColorNorm)
                              ? tintGarmentImage(mockupImage, primaryColorHex) as any
                              : mockupImage
                          }
                          x={imageSize.x}
                          y={imageSize.y}
                          width={imageSize.width}
                          height={imageSize.height}
                        />
                      )}
                    </Layer>

                    <Layer listening={false}>
                      {/* Grid */}
                      {!isCapturingMockup && showGrid && (
                        <>
                          {Array.from({ length: Math.ceil(stageSize.width / 20) }).map((_, i) => (
                            <Line
                              key={`v-${i}`}
                              points={[i * 20, 0, i * 20, stageSize.height]}
                              stroke="#e0e0e0"
                              strokeWidth={0.5}
                            />
                          ))}
                          {Array.from({ length: Math.ceil(stageSize.height / 20) }).map((_, i) => (
                            <Line
                              key={`h-${i}`}
                              points={[0, i * 20, stageSize.width, i * 20]}
                              stroke="#e0e0e0"
                              strokeWidth={0.5}
                            />
                          ))}
                        </>
                      )}

                      {/* Rulers */}
                      {!isCapturingMockup && showRulers && (
                        <>
                          {/* Ruler backgrounds */}
                          <Rect x={0} y={0} width={stageSize.width} height={24} fill="#f8fafc" stroke="#e5e7eb" strokeWidth={1} listening={false} />
                          <Rect x={0} y={0} width={24} height={stageSize.height} fill="#f8fafc" stroke="#e5e7eb" strokeWidth={1} listening={false} />

                          {/* Unit labels */}
                          <Text x={4} y={6} text={"in"} fontSize={10} fill="#64748b" listening={false} />
                          <Text x={4} y={4} text={"in"} fontSize={10} fill="#64748b" listening={false} />

                          {/* Top ruler ticks and labels (inches) */}
                          {Array.from({ length: Math.ceil((stageSize.width - canvasPadding * 2) / PX_PER_INCH) + 1 }).map((_, i) => {
                            const x = Math.round(canvasPadding + i * PX_PER_INCH);
                            const isMajor = true; // inch marks only
                            return (
                              <Group key={`rt-${i}`} listening={false}>
                                <Line points={[x, 24, x, 14]} stroke="#94a3b8" strokeWidth={1} />
                                <Text x={x + 2} y={6} text={`${i}"`} fontSize={10} fill="#64748b" />
                              </Group>
                            );
                          })}

                          {/* Left ruler ticks and labels (inches) */}
                          {Array.from({ length: Math.ceil((stageSize.height - canvasPadding * 2) / PX_PER_INCH) + 1 }).map((_, i) => {
                            const y = Math.round(canvasPadding + i * PX_PER_INCH);
                            return (
                              <Group key={`rl-${i}`} listening={false}>
                                <Line points={[24, y, 14, y]} stroke="#94a3b8" strokeWidth={1} />
                                <Text x={4} y={y + 2} text={`${i}"`} fontSize={10} fill="#64748b" />
                              </Group>
                            );
                          })}
                        </>
                      )}
                    </Layer>

                    {/* Placeholder Outlines Layer — only in edit mode */}
                    <Layer>
                      {!previewMode && !isCapturingMockup && (() => {
                        // Render all placeholders defined for this view
                        const visiblePlaceholders = placeholders;

                        return visiblePlaceholders.map((ph) => {
                          const isSelected = selectedPlaceholderId === ph.id;
                          const baseColor = ph.original.color || 'rgba(247, 181, 215, 1)';

                          const hexToRgba = (hex: string, alpha: number) => {
                            if (!hex.startsWith('#') || hex.length !== 7) return `rgba(251, 207, 232, ${alpha})`;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                          };

                          const stroke = baseColor;
                          const strokeWidth = isSelected ? 2 : 1;
                          const fill = hexToRgba(baseColor, isSelected ? 0.25 : 0.15);

                          const commonHandlers = {
                            onClick: () => {
                              setSelectedPlaceholderId(ph.id);
                              selectedPlaceholderIdRef.current = ph.id;
                              // toast.info(`${ph.original.name || 'Placeholder'} selected`);
                            },
                            onTap: () => {
                              setSelectedPlaceholderId(ph.id);
                              selectedPlaceholderIdRef.current = ph.id;
                              // toast.info(`${ph.original.name || 'Placeholder'} selected`);
                            },
                          } as any;

                          if (ph.isPolygon && ph.polygonPointsPx && ph.polygonPointsPx.length >= 6) {
                            return (
                              <Line
                                key={ph.id}
                                points={ph.polygonPointsPx}
                                closed
                                stroke={stroke}
                                strokeWidth={strokeWidth}
                                fill={fill}
                                listening
                                isPlaceholder={true}
                                perfectDrawEnabled={false}
                                {...commonHandlers}
                              />
                            );
                          }

                          return (
                            <Rect
                              key={ph.id}
                              x={ph.x}
                              y={ph.y}
                              width={ph.width}
                              height={ph.height}
                              stroke={stroke}
                              strokeWidth={strokeWidth}
                              fill={fill}
                              listening
                              isPlaceholder={true}
                              {...commonHandlers}
                            />
                          );
                        });
                      })()}
                    </Layer>

                    {/* Interactive Elements Layer — slight opacity in preview so design "sinks" into fabric */}
                    <Layer opacity={previewMode ? 0.90 : 1}>
                      {elements
                        .filter((el) => el.view === currentView && el.visible !== false)
                        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                        .map((el) => {
                          const placeholder = el.placeholderId
                            ? placeholders.find((p) => p.id === el.placeholderId)
                            : undefined;
                          const elPrintArea = placeholder
                            ? {
                              x: placeholder.x,
                              y: placeholder.y,
                              width: placeholder.width,
                              height: placeholder.height,
                              isPolygon: placeholder.isPolygon,
                              polygonPointsPx: placeholder.polygonPointsPx,
                            }
                            : printArea;

                          if (el.type === 'image') {
                            return (
                              <ImageElement
                                key={el.id}
                                element={el}
                                isSelected={selectedIds.includes(el.id)}
                                onSelect={() => {
                                  if (activeTool === 'move') return;
                                  setSelectedIds([el.id]);
                                  if (!isMobile) setRightPanelTab('properties');
                                }}
                                onUpdate={(updates, saveImmediately = false) => {
                                  updateElement(el.id, updates, !saveImmediately);
                                  if (saveImmediately) {
                                    setTimeout(() => saveToHistory(true), 0);
                                  }
                                }}
                                printArea={elPrintArea}
                                isEditMode={!previewMode && !el.locked}
                                previewMode={previewMode}
                              />
                            );
                          }
                          if (el.type === 'text') {
                            return (
                              <TextElement
                                key={el.id}
                                element={el}
                                isSelected={selectedIds.includes(el.id)}
                                onSelect={() => {
                                  if (activeTool === 'move') return;
                                  if (selectedIds.includes(el.id)) {
                                    handleTextDblClick(el.id);
                                  } else {
                                    setSelectedIds([el.id]);
                                    if (!isMobile) setRightPanelTab('properties');
                                  }
                                }}
                                onDblClick={() => handleTextDblClick(el.id)}
                                isEditing={editingTextId === el.id}
                                onUpdate={(updates, saveImmediately = false) => {
                                  updateElement(el.id, updates, !saveImmediately);
                                  if (saveImmediately) {
                                    setTimeout(() => saveToHistory(true), 0);
                                  }
                                }}
                                printArea={elPrintArea}
                                isEditMode={!previewMode && !el.locked}
                                previewMode={previewMode}
                              />
                            );
                          }
                          if (el.type === 'shape') {
                            return (
                              <ShapeElement
                                key={el.id}
                                element={el}
                                isSelected={selectedIds.includes(el.id)}
                                onSelect={() => {
                                  if (activeTool === 'move') return;
                                  setSelectedIds([el.id]);
                                  if (!isMobile) setRightPanelTab('properties');
                                }}
                                onUpdate={(updates) => {
                                  updateElement(el.id, updates, true);
                                }}
                                printArea={elPrintArea}
                                isEditMode={!previewMode && !el.locked}
                                previewMode={previewMode}
                              />
                            );
                          }
                          return null;
                        })}

                      {/* X/Y axis guides and handles for active image (edit mode only) */}
                      {(!previewMode && selectedIds.length === 1) && (() => {
                        const sel = elements.find(e => e.id === selectedIds[0]);
                        if (!sel || sel.type !== 'image' || !sel.width || !sel.height) return null;
                        const ph = sel.placeholderId
                          ? placeholders.find(p => p.id === sel.placeholderId)
                          : undefined;
                        const area = ph
                          ? { x: ph.x, y: ph.y, width: ph.width, height: ph.height }
                          : printArea;
                        if (!area) return null;
                        const centerX = (sel.x || 0) + (sel.width || 0) / 2;
                        const centerY = (sel.y || 0) + (sel.height || 0) / 2;

                        const horizY = Math.max(area.y, Math.min(centerY, area.y + area.height));
                        const vertX = Math.max(area.x, Math.min(centerX, area.x + area.width));

                        const handleSize = 12;
                        const halfH = (sel.height || 0) / 2;
                        const halfW = (sel.width || 0) / 2;

                        const rightHandleX = centerX + halfW - handleSize / 2;
                        const topHandleY = centerY - halfH - handleSize / 2;

                        return (
                          <>
                            {/* Guide lines */}
                            <Line points={[area.x, horizY, area.x + area.width, horizY]} stroke="#ef4444" strokeWidth={1} dash={[6, 6]} listening={false} />
                            <Line points={[vertX, area.y, vertX, area.y + area.height]} stroke="#ef4444" strokeWidth={1} dash={[6, 6]} listening={false} />

                            {/* Horizontal resize handle (adjust width symmetrically) */}
                            <Rect
                              x={rightHandleX}
                              y={centerY - handleSize / 2}
                              width={handleSize}
                              height={handleSize}
                              fill="#3b82f6"
                              stroke="#2563eb"
                              strokeWidth={1}
                              cornerRadius={2}
                              draggable
                              dragBoundFunc={(pos) => {
                                // lock Y to center, constrain X inside area
                                const y = centerY - handleSize / 2;
                                const minX = area.x - handleSize / 2;
                                const maxX = area.x + area.width - handleSize / 2;
                                return { x: Math.max(minX, Math.min(pos.x, maxX)), y };
                              }}
                              onDragMove={(e) => {
                                const handleX = e.target.x() + handleSize / 2;
                                const newHalfW = Math.abs(handleX - centerX);
                                let newW = Math.max(10, Math.min(newHalfW * 2, area.width));
                                // Constrain so image stays within area horizontally
                                const newX = Math.max(area.x, Math.min(centerX - newW / 2, area.x + area.width - newW));
                                updateElement(sel.id, { width: newW, x: newX });
                              }}
                            />

                            {/* Vertical resize handle (adjust height symmetrically) */}
                            <Rect
                              x={centerX - handleSize / 2}
                              y={topHandleY}
                              width={handleSize}
                              height={handleSize}
                              fill="#3b82f6"
                              stroke="#2563eb"
                              strokeWidth={1}
                              cornerRadius={2}
                              draggable
                              dragBoundFunc={(pos) => {
                                // lock X to center, constrain Y inside area
                                const x = centerX - handleSize / 2;
                                const minY = area.y - handleSize / 2;
                                const maxY = area.y + area.height - handleSize / 2;
                                return { x, y: Math.max(minY, Math.min(pos.y, maxY)) };
                              }}
                              onDragMove={(e) => {
                                const handleY = e.target.y() + handleSize / 2;
                                const newHalfH = Math.abs(handleY - centerY);
                                let newH = Math.max(10, Math.min(newHalfH * 2, area.height));
                                // Constrain so image stays within area vertically
                                const newY = Math.max(area.y, Math.min(centerY - newH / 2, area.y + area.height - newH));
                                updateElement(sel.id, { height: newH, y: newY });
                              }}
                            />
                          </>
                        );
                      })()}

                      {/* Transformer for selected element - always visible when selected */}
                      {selectedIds.length === 1 && !previewMode && !isCapturingMockup && (
                        <Transformer
                          ref={transformerRef}
                          rotateEnabled={true}
                          borderEnabled={true}
                          borderStroke="#3b82f6"
                          borderStrokeWidth={2}
                          anchorFill="#ffffff"
                          anchorStroke="#3b82f6"
                          anchorStrokeWidth={2}
                          anchorSize={isMobile ? 14 : 10}
                          anchorCornerRadius={isMobile ? 7 : 4}
                          keepRatio={false}
                          boundBoxFunc={(oldBox, newBox) => {
                            // Constrain transformer to print area if element has placeholder
                            const selectedElement = elements.find(e => e.id === selectedIds[0]);
                            if (selectedElement && selectedElement.placeholderId) {
                              const placeholder = placeholders.find(p => p.id === selectedElement.placeholderId);
                              if (placeholder) {
                                const minX = placeholder.x;
                                const minY = placeholder.y;
                                const maxX = placeholder.x + placeholder.width;
                                const maxY = placeholder.y + placeholder.height;

                                return {
                                  ...newBox,
                                  x: Math.max(minX, Math.min(newBox.x, maxX - newBox.width)),
                                  y: Math.max(minY, Math.min(newBox.y, maxY - newBox.height)),
                                  width: Math.min(newBox.width, maxX - Math.max(minX, newBox.x)),
                                  height: Math.min(newBox.height, maxY - Math.max(minY, newBox.y)),
                                };
                              }
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Layer>
                    {/* Selection Box Visualizer - edit mode only */}
                    {!previewMode && !isCapturingMockup && selectionBox && selectionBox.active && (
                      <Layer>
                        <Rect
                          x={Math.min(selectionBox.x1, selectionBox.x2)}
                          y={Math.min(selectionBox.y1, selectionBox.y2)}
                          width={Math.abs(selectionBox.x2 - selectionBox.x1)}
                          height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                          fill="rgba(59, 130, 246, 0.12)"
                          stroke="#3b82f6"
                          strokeWidth={1}
                          listening={false}
                        />
                      </Layer>
                    )}


                    {/* ── Fabric realism — preview only; skipped during capture so exported PNGs stay clean.
                        Applied GLOBALLY over the full garment display area (imageSize), not per-element.
                        Per-element clipping caused a visible rectangle on every garment colour — this
                        approach is seamless because the blend is uniform across the whole shirt. */}
                    {previewMode && !isCapturingMockup && mockupImage && imageSize.width > 0 && (
                      <Layer listening={false}>
                        {(() => {
                          const garmentSrc: HTMLImageElement | HTMLCanvasElement =
                            primaryColorHex && _primaryColorNorm
                              ? (tintGarmentImage(mockupImage, primaryColorHex) as any)
                              : mockupImage;
                          const { x: gx, y: gy, width: gw, height: gh } = imageSize;
                          return (
                            <>
                              {/* PASS 1 — Garment multiply: the shirt's own shadows and colour bleed
                                  through the design uniformly, tinting printed ink as real fabric would. */}
                              <Shape
                                sceneFunc={(ctx, shape) => {
                                  ctx.save();
                                  ctx.globalCompositeOperation = 'multiply';
                                  ctx.globalAlpha = 0.20;
                                  ctx.drawImage(garmentSrc, gx, gy, gw, gh);
                                  ctx.restore();
                                  ctx.fillStrokeShape(shape);
                                }}
                                fill="transparent"
                                perfectDrawEnabled={false}
                              />
                              {/* PASS 2 — Soft-light: garment highlights and surface sheen lift the design. */}
                              <Shape
                                sceneFunc={(ctx, shape) => {
                                  ctx.save();
                                  ctx.globalCompositeOperation = 'soft-light';
                                  ctx.globalAlpha = 0.18;
                                  ctx.drawImage(mockupImage, gx, gy, gw, gh);
                                  ctx.restore();
                                  ctx.fillStrokeShape(shape);
                                }}
                                fill="transparent"
                                perfectDrawEnabled={false}
                              />
                            </>
                          );
                        })()}
                      </Layer>
                    )}
                  </Stage>

                  {/* Text Editing Overlay - Must be outside Stage (HTML elements can't be inside Konva) */}
                  {editingTextId && (() => {
                    const el = elements.find(e => e.id === editingTextId);
                    if (!el || el.type !== 'text') return null;

                    const placeholder = el.placeholderId
                      ? placeholders.find(p => p.id === el.placeholderId)
                      : null;
                    const maxWidth = placeholder ? placeholder.width : undefined;

                    return (
                      <div
                        style={{
                          position: 'absolute',
                          left: el.x,
                          top: el.y - ((el.fontSize || 24) * 0.15),
                          transform: `rotate(${el.rotation || 0}deg)`,
                          transformOrigin: 'top left',
                          zIndex: 1000,
                        }}
                      >
                        <textarea
                          value={el.text}
                          onFocus={(e) => {
                            if (el.text === 'Enter text' || el.text === 'Text' || el.text === ' ') {
                              updateElement(el.id, { text: '' });
                              setTimeout(() => e.target.select(), 0);
                            }
                          }}
                          onBlur={() => setEditingTextId(null)}
                          autoFocus
                          style={{
                            fontSize: `${el.fontSize || 24}px`,
                            fontFamily: el.fontFamily || 'Arial',
                            color: el.fill || '#000000',
                            background: 'transparent',
                            border: '1px dashed #9ca3af',
                            padding: 0,
                            margin: 0,
                            outline: 'none',
                            resize: 'none',
                            overflow: 'hidden',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            width: maxWidth
                              ? `${maxWidth}px`
                              : `${getTextWidth(el.text || '', el.fontSize || 24, el.fontFamily || 'Arial') + 20}px`,
                            maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                            height: `${(el.fontSize || 24) * 1.2}px`,
                            lineHeight: 1.2,
                            textAlign: (el.align as any) || 'left',
                          }}
                          ref={(ref) => {
                            if (ref) {
                              ref.style.height = '0px';
                              ref.style.height = (ref.scrollHeight) + 'px';
                              if (document.activeElement !== ref) {
                                ref.focus();
                              }
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = '0px';
                            target.style.height = (target.scrollHeight) + 'px';
                          }}
                          onChange={(e) => {
                            const newText = e.target.value;
                            updateElement(el.id, { text: newText });
                          }}
                        />
                      </div>
                    );
                  })()}

                  {/* Mobile Hand Tool Toggle */}
                  {isMobile && !previewMode && (
                    <div className="absolute left-4 bottom-24 z-20 flex flex-col gap-2">
                      <Button
                        variant={activeTool === 'move' ? 'default' : 'secondary'}
                        size="icon"
                        onClick={() => setActiveTool(activeTool === 'move' ? 'select' : 'move')}
                        className={`w-12 h-12 rounded-full shadow-lg ${activeTool === 'move' ? 'bg-primary' : 'bg-background'}`}
                      >
                        <Hand className={`w-6 h-6 ${activeTool === 'move' ? 'text-primary-foreground' : 'text-foreground'}`} />
                      </Button>
                    </div>
                  )}

                  {/* Mobile Selection Toolbar */}
                  {isMobile && !previewMode && selectedIds.length > 0 && (
                    <div style={mobileToolbarStyle}>
                      {selectedIds.length === 1 && elements.find(e => e.id === selectedIds[0])?.type === 'text' ? (
                        <div className="bg-background/95 backdrop-blur-sm border shadow-xl rounded-xl p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                          {/* Font dropdown placeholder style */}
                          <div className="flex items-center gap-2 border-r pr-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 font-medium">
                              {elements.find(e => e.id === selectedIds[0])?.fontFamily || 'Arial'}
                              <ChevronRight className="w-3 h-3 rotate-90" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 border-r pr-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" className="h-9 w-12 px-0">
                              {Math.round(elements.find(e => e.id === selectedIds[0])?.fontSize || 24)}
                            </Button>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant={elements.find(e => e.id === selectedIds[0])?.fontStyle?.includes('bold') ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => {
                                const el = elements.find(e => e.id === selectedIds[0]);
                                const current = el?.fontStyle || '';
                                updateElement(selectedIds[0], { fontStyle: current.includes('bold') ? current.replace('bold', '').trim() : `${current} bold`.trim() });
                              }}
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={elements.find(e => e.id === selectedIds[0])?.fontStyle?.includes('italic') ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => {
                                const el = elements.find(e => e.id === selectedIds[0]);
                                const current = el?.fontStyle || '';
                                updateElement(selectedIds[0], { fontStyle: current.includes('italic') ? current.replace('italic', '').trim() : `${current} italic`.trim() });
                              }}
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant={elements.find(e => e.id === selectedIds[0])?.align === 'left' ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateElement(selectedIds[0], { align: 'left' })}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={elements.find(e => e.id === selectedIds[0])?.align === 'center' ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateElement(selectedIds[0], { align: 'center' })}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={elements.find(e => e.id === selectedIds[0])?.align === 'right' ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateElement(selectedIds[0], { align: 'right' })}
                            >
                              <AlignRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 border-l pl-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => deleteSelected()}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-background/95 backdrop-blur-sm border shadow-xl rounded-xl p-2 flex items-center gap-1 overflow-x-auto no-scrollbar justify-center">
                          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => {
                            const el = elements.find(e => e.id === selectedIds[0]);
                            if (el) updateElement(el.id, { flipX: !el.flipX });
                          }}>
                            <RotateCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={duplicateSelected}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={deleteSelected}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!isMobile && availableViews.length > 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-2xl p-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 items-center">
                  {availableViews.map((viewKey) => {
                    const isActive = currentView === viewKey;
                    return (
                      <button
                        key={viewKey}
                        onClick={() => handleViewSwitch(viewKey)}
                        className={`px-6 py-2.5 transition-all duration-200 font-bold text-[13px] tracking-wide focus:outline-none min-w-[80px] ${isActive
                            ? 'bg-[#22c55e] text-white rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.3)]'
                            : 'text-[#334155] hover:text-[#22c55e] bg-transparent'
                          }`}
                      >
                        {viewKey.charAt(0).toUpperCase() + viewKey.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No view data available
            </div>
          )}
        </div>

        {/* Right Panel (Desktop) */}
        {!previewMode && showRightPanel && !isMobile && (
          <div className="w-[350px] border-l bg-background flex flex-col h-full">
            <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full rounded-none border-b flex-shrink-0">
                <TabsTrigger value="product" className="flex-1">Product</TabsTrigger>
                <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
                <TabsTrigger value="layers" className="flex-1">Layers</TabsTrigger>
              </TabsList>

              <TabsContent value="product" className="flex-1 overflow-y-auto p-4 min-h-0">
                <ProductInfoPanel
                  product={product}
                  isLoading={isLoadingProduct}
                  selectedColors={selectedColors}
                  selectedSizes={selectedSizes}
                  selectedSizesByColor={selectedSizesByColor}
                  onColorToggle={handleColorToggle}
                  onSizeToggle={handleSizeToggle}
                  onSizeToggleForColor={handleSizeToggleForColor}
                  onPrimaryColorHexChange={(hex) => {
                    setPrimaryColorHex(hex);
                    setHasUnsavedChanges(true);
                  }}
                  selectedPrintMethodId={selectedPrintMethodsByView[currentView] ?? null}
                  onPrintMethodChange={(methodId) => {
                    setSelectedPrintMethodsByView(prev => ({ ...prev, [currentView]: methodId }));
                    setHasUnsavedChanges(true);
                  }}
                  designAreaSqIn={actualDesignAreaSqIn}
                  selectedPrintMethodsByView={selectedPrintMethodsByView}
                  designAreaByView={designAreaByView}
                  currentView={currentView}
                />
              </TabsContent>

              <TabsContent value="properties" className="flex-1 overflow-y-auto p-4 min-h-0">
                <PropertiesPanel
                  selectedPlaceholderId={selectedPlaceholderId}
                  placeholders={placeholders}
                  designUrlsByPlaceholder={getDesignUrlsForView(currentView)}
                  onDesignUpload={(placeholderId, designUrl) => {
                    setDesignUrlForView(currentView, placeholderId, designUrl);
                  }}
                  onDesignRemove={(placeholderId) => {
                    removeDesignUrlForView(currentView, placeholderId);
                  }}
                  displacementSettings={displacementSettings}
                  onDisplacementSettingsChange={handleDisplacementSettingsChange}
                  selectedElementIds={selectedIds}
                  elements={elements}
                  onElementUpdate={(updates) => {
                    selectedIds.forEach(id => updateElement(id, updates, false));
                    setTimeout(() => saveToHistory(true), 0); // Immediate save for property updates
                  }}
                  onElementDelete={(id) => {
                    setElements(prev => prev.filter(el => el.id !== id));
                    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
                    setHasUnsavedChanges(true);
                    setTimeout(() => saveToHistory(true), 0); // Immediate save for delete
                  }}
                  PX_PER_INCH={PX_PER_INCH}
                  canvasPadding={canvasPadding}
                />
              </TabsContent>

              <TabsContent value="layers" className="flex-1 overflow-y-auto p-4 min-h-0">
                <LayersPanel
                  placeholders={placeholders}
                  selectedPlaceholderId={selectedPlaceholderId}
                  onSelectPlaceholder={(id) => {
                    setSelectedPlaceholderId(id);
                    selectedPlaceholderIdRef.current = id;
                    setSelectedIds([]);
                  }}
                  designUrlsByPlaceholder={getDesignUrlsForView(currentView)}
                  onDesignRemove={(placeholderId) => {
                    removeDesignUrlForView(currentView, placeholderId);
                  }}
                  elements={elements}
                  selectedIds={selectedIds}
                  onSelectElement={(id) => {
                    setSelectedIds([id]);
                    setSelectedPlaceholderId(null);
                    selectedPlaceholderIdRef.current = null;
                    if (!isMobile) setRightPanelTab('properties');
                  }}
                  onUpdate={updateElement}
                  onDelete={(id) => {
                    setElements(prev => prev.filter(el => el.id !== id));
                    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
                    setHasUnsavedChanges(true); // Mark as having unsaved changes
                    setTimeout(() => saveToHistory(true), 0); // Immediate save for delete
                  }}
                  onReorder={(newOrder) => {
                    setElements(newOrder);
                    setHasUnsavedChanges(true); // Mark as having unsaved changes
                    setTimeout(() => saveToHistory(true), 0); // Immediate save for reorder
                  }}
                  PX_PER_INCH={PX_PER_INCH}
                  canvasPadding={canvasPadding}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Mobile Panels - Drawer based */}
        {isMobile && !previewMode && (
          <Drawer
            open={showRightPanel}
            onOpenChange={setShowRightPanel}
            modal={false}
            snapPoints={[0.3, 0.6, 0.8]}
          >
            <DrawerContent className="h-full border-t border-border/50 shadow-2xl" showOverlay={false}>
              <DrawerHeader className="text-left border-b pb-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="capitalize">
                    {rightPanelTab}
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <X className="w-5 h-5" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {rightPanelTab === 'product' && (
                  <ProductInfoPanel
                    product={product}
                    isLoading={isLoadingProduct}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                    selectedSizesByColor={selectedSizesByColor}
                    onColorToggle={handleColorToggle}
                    onSizeToggle={handleSizeToggle}
                    onSizeToggleForColor={handleSizeToggleForColor}
                    onPrimaryColorHexChange={(hex) => {
                      setPrimaryColorHex(hex);
                      setHasUnsavedChanges(true);
                    }}
                    selectedPrintMethodId={selectedPrintMethodsByView[currentView] ?? null}
                    onPrintMethodChange={(methodId) => {
                      setSelectedPrintMethodsByView(prev => ({ ...prev, [currentView]: methodId }));
                      setHasUnsavedChanges(true);
                    }}
                    designAreaSqIn={actualDesignAreaSqIn}
                    selectedPrintMethodsByView={selectedPrintMethodsByView}
                    designAreaByView={designAreaByView}
                    currentView={currentView}
                  />
                )}

                {rightPanelTab === 'layers' && (
                  <LayersPanel
                    placeholders={placeholders}
                    selectedPlaceholderId={selectedPlaceholderId}
                    onSelectPlaceholder={(id) => {
                      setSelectedPlaceholderId(id);
                      selectedPlaceholderIdRef.current = id;
                      setSelectedIds([]);
                    }}
                    designUrlsByPlaceholder={getDesignUrlsForView(currentView)}
                    onDesignRemove={(placeholderId) => {
                      removeDesignUrlForView(currentView, placeholderId);
                    }}
                    elements={elements}
                    selectedIds={selectedIds}
                    onSelectElement={(id) => {
                      setSelectedIds([id]);
                      setSelectedPlaceholderId(null);
                      selectedPlaceholderIdRef.current = null;
                      if (!isMobile) setRightPanelTab('properties');
                    }}
                    onUpdate={updateElement}
                    onDelete={(id) => {
                      setElements(prev => prev.filter(el => el.id !== id));
                      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
                      setHasUnsavedChanges(true);
                      setTimeout(() => saveToHistory(true), 0);
                    }}
                    onReorder={(newOrder) => {
                      setElements(newOrder);
                      setHasUnsavedChanges(true);
                      setTimeout(() => saveToHistory(true), 0);
                    }}
                    PX_PER_INCH={PX_PER_INCH}
                    canvasPadding={canvasPadding}
                    // Props for Mobile Properties Integration
                    isMobile={true}
                    displacementSettings={displacementSettings}
                    onDisplacementSettingsChange={handleDisplacementSettingsChange}
                    onDesignUpload={(placeholderId, designUrl) => {
                      setDesignUrlForView(currentView, placeholderId, designUrl);
                    }}
                  />
                )}

                {rightPanelTab === 'previews' && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Mockup Previews</p>
                    {availableViews.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No views available</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {availableViews.map(viewKey => {
                          const previewUrl = savedMockupPreviews[viewKey];
                          const isCurrentView = currentView === viewKey;
                          return (
                            <button
                              key={viewKey}
                              onClick={() => { handleViewSwitch(viewKey); setShowRightPanel(false); }}
                              className={`group relative flex flex-col rounded-lg overflow-hidden border transition-all ${isCurrentView ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                                }`}
                            >
                              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                  <img src={previewUrl} alt={`${viewKey} mockup`} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                    <div className="text-2xl font-bold opacity-30">{viewKey.slice(0, 2).toUpperCase()}</div>
                                    <span className="text-[10px]">No preview yet</span>
                                  </div>
                                )}
                              </div>
                              <div className={`py-1.5 px-2 text-center text-xs font-medium capitalize ${isCurrentView ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                                {viewKey}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {availableViews.length > 0 && Object.keys(savedMockupPreviews).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Click Save to generate mockup previews.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Bottom Bar */}
      {(!previewMode || !isMobile) && (
        <div className={`${isMobile ? 'h-[75px] pb-2' : 'h-[50px]'} border-t flex items-center justify-between px-4 bg-background z-30`}>
          {isMobile ? (
            <div className="w-full flex items-center justify-around relative px-4">
              {/* Mobile Left Group */}
              <div className="flex items-center opacity-80">
                <button
                  onClick={() => {
                    setRightPanelTab('product');
                    setShowRightPanel(true);
                    setShowLeftPanel(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 group transition-all active:scale-95 ${rightPanelTab === 'product' && showRightPanel ? 'text-primary scale-105' : 'text-muted-foreground'}`}
                >
                  <div className={`p-1.5 rounded-md ${rightPanelTab === 'product' && showRightPanel ? 'bg-primary/10' : 'group-active:bg-muted'}`}>
                    <Package className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide">Products</span>
                </button>
              </div>

              {/* Space for the Floating Plus Button */}
              <div className="w-20" />

              {/* Floating Plus Button (Absolute context) */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-12">
                <div className={`cta-pulse ${isMobileMenuOpen ? 'stop-pulse' : ''}`}>
                  <Button
                    size="icon"
                    onClick={() => {
                      setIsMobileMenuOpen(true);
                      setMobileToolStage('menu');
                      setShowRightPanel(false);
                      setShowLeftPanel(false);
                    }}
                    className="w-18 h-18 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-primary hover:bg-primary/95 border-4 border-background flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-20"
                    style={{
                      width: '72px',
                      height: '72px',
                      boxShadow: '0 10px 25px -5px rgba(var(--primary), 0.4), 0 8px 10px -6px rgba(var(--primary), 0.4)'
                    }}
                  >
                    <Plus className="w-10 h-10 text-primary-foreground stroke-[3]" />
                  </Button>
                </div>
              </div>

              {/* Mobile Right Group */}
              <div className="flex items-center opacity-80">
                <button
                  onClick={() => {
                    setRightPanelTab('layers');
                    setShowRightPanel(true);
                    setShowLeftPanel(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 group transition-all active:scale-95 ${rightPanelTab === 'layers' && showRightPanel ? 'text-primary scale-105' : 'text-muted-foreground'}`}
                >
                  <div className={`p-1.5 rounded-md ${rightPanelTab === 'layers' && showRightPanel ? 'bg-primary/10' : 'group-active:bg-muted'}`}>
                    <Layers className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide">Layers</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {!previewMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setZoom(prev => Math.max(10, prev - 10))}
                      className="h-8 w-8"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm w-16 text-center tabular-nums">{zoom}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setZoom(prev => Math.min(500, prev + 10))}
                      className="h-8 w-8"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={fitToScreen} className="h-8 text-xs">Fit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setZoom(100)} className="h-8 text-xs">100%</Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={showGrid ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setShowGrid(!showGrid)}
                      className="h-8 w-8 shadow-none"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={showRulers ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setShowRulers(!showRulers)}
                      className="h-8 w-8 shadow-none"
                    >
                      <Ruler className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1" />
              )}

              <div className="flex items-center">
                <Button
                  variant="default"
                  className={`px-8 h-9 text-xs font-semibold ${(!variantValidation.isValid || !printMethodValidation.isValid) ? 'opacity-50 grayscale' : ''}`}
                  onClick={handlePublishToStore}
                  disabled={isPublishing}
                >
                  {isPublishing ? 'Publishing...' : 'Add Product'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignEditor;
