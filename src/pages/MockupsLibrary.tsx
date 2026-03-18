import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storeProductsApi, productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, ArrowLeft, Image as ImageIcon, Save, Check, Loader2, Sparkles, ChevronRight, Eye, Download, Zap, Package } from 'lucide-react';
import { RealisticWebGLPreview } from '@/components/admin/RealisticWebGLPreview';
import type { DisplacementSettings, DesignPlacement } from '@/types/product';
import { toast } from 'sonner';
import { RAW_API_URL } from '@/config';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LocationState {
    storeProductId?: string;
    productId?: string;
    title?: string;
    selectedColors?: string[];
    selectedSizes?: string[];
    primaryColorHex?: string | null;
}

const MockupsLibrary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state || {}) as LocationState;

    const [storeProductId] = useState<string | undefined>(state.storeProductId);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [storeProduct, setStoreProduct] = useState<any | null>(null);
    const [sampleMockups, setSampleMockups] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [isLoadingMockups, setIsLoadingMockups] = useState(false);
    const [catalogPhysicalDimensions, setCatalogPhysicalDimensions] = useState<{ width: number; height: number } | null>(null);

    const [previewMap, setPreviewMap] = useState<Record<string, string>>({});
    const [generatingMap, setGeneratingMap] = useState<Record<string, boolean>>({});
    const previewCache = useRef<Record<string, string>>({});

    const defaultDisplacementSettings: DisplacementSettings = {
        scaleX: 45,
        scaleY: 45,
        contrastBoost: 2.0,
    };
    const [displacementSettings, setDisplacementSettings] = useState<DisplacementSettings>(defaultDisplacementSettings);
    const [savedMockupUrls, setSavedMockupUrls] = useState<Record<string, string>>({});
    const [savingMockups, setSavingMockups] = useState<Record<string, boolean>>({});
    const [allSaved, setAllSaved] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);

    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedSizesByColor, setSelectedSizesByColor] = useState<Record<string, string[]>>({});
    const [primaryColorHex, setPrimaryColorHex] = useState<string | null>(null);

    const [availableColors, setAvailableColors] = useState<string[]>([]);
    const [currentPreviewColor, setCurrentPreviewColor] = useState<string | null>(null);

    const convertPlaceholderToPixels = (
        placeholder: any,
        mockupImgWidth: number,
        mockupImgHeight: number,
        physicalDimensions: { width: number; height: number }
    ) => {
        const physW = physicalDimensions.width;
        const physH = physicalDimensions.height;

        const CANVAS_WIDTH = 800;
        const CANVAS_HEIGHT = 600;
        const CANVAS_PADDING = 40;
        const EFFECTIVE_W = CANVAS_WIDTH - CANVAS_PADDING * 2;
        const EFFECTIVE_H = CANVAS_HEIGHT - CANVAS_PADDING * 2;

        const pxPerInchCanvas = Math.min(EFFECTIVE_W / physW, EFFECTIVE_H / physH);

        const aspectRatio = mockupImgWidth / mockupImgHeight;
        let imgCanvasW = EFFECTIVE_W;
        let imgCanvasH = imgCanvasW / aspectRatio;
        if (imgCanvasH > EFFECTIVE_H) {
            imgCanvasH = EFFECTIVE_H;
            imgCanvasW = EFFECTIVE_H * aspectRatio;
        }

        const imgStageX = CANVAS_PADDING + (EFFECTIVE_W - imgCanvasW) / 2;
        const imgStageY = CANVAS_PADDING + (EFFECTIVE_H - imgCanvasH) / 2;

        const scaleToRaw = mockupImgWidth / imgCanvasW;

        const usesInches = placeholder.xIn !== undefined || placeholder.widthIn !== undefined;

        if (usesInches) {
            const xIn = placeholder.xIn || 0;
            const yIn = placeholder.yIn || 0;
            const widthIn = placeholder.widthIn || 0;
            const heightIn = placeholder.heightIn || 0;
            const rotation = placeholder.rotationDeg || placeholder.rotation || 0;

            const xStage = CANVAS_PADDING + xIn * pxPerInchCanvas;
            const yStage = CANVAS_PADDING + yIn * pxPerInchCanvas;
            const wStage = widthIn * pxPerInchCanvas;
            const hStage = heightIn * pxPerInchCanvas;

            const xRelStage = xStage - imgStageX;
            const yRelStage = yStage - imgStageY;

            const x = xRelStage * scaleToRaw;
            const y = yRelStage * scaleToRaw;
            const width = wStage * scaleToRaw;
            const height = hStage * scaleToRaw;

            return { x, y, width, height, rotation };
        } else {
            return {
                x: placeholder.x || 0,
                y: placeholder.y || 0,
                width: placeholder.width || 0,
                height: placeholder.height || 0,
                rotation: placeholder.rotationDeg || placeholder.rotation || 0
            };
        }
    };

    const generateMockupPreview = async (
        mockupUrl: string,
        designUrl: string,
        placeholder: any,
        physicalDimensions: { width: number; height: number }
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get canvas context');

            const mockupImg = new Image();
            mockupImg.crossOrigin = 'anonymous';

            mockupImg.onload = () => {
                canvas.width = mockupImg.width;
                canvas.height = mockupImg.height;

                ctx.drawImage(mockupImg, 0, 0);

                const designImg = new Image();
                designImg.crossOrigin = 'anonymous';

                designImg.onload = () => {
                    const { x, y, width, height, rotation } = convertPlaceholderToPixels(
                        placeholder,
                        mockupImg.width,
                        mockupImg.height,
                        physicalDimensions
                    );

                    if (width <= 0 || height <= 0) {
                        resolve(canvas.toDataURL('image/png'));
                        return;
                    }

                    ctx.save();

                    const centerX = x + width / 2;
                    const centerY = y + height / 2;
                    ctx.translate(centerX, centerY);
                    ctx.rotate((rotation * Math.PI) / 180);

                    ctx.beginPath();
                    ctx.rect(-width / 2, -height / 2, width, height);
                    ctx.clip();

                    const designAspect = designImg.width / designImg.height;
                    const placeholderAspect = width / height;

                    let drawWidth, drawHeight, drawX, drawY;

                    if (designAspect > placeholderAspect) {
                        drawHeight = height;
                        drawWidth = height * designAspect;
                        drawX = -drawWidth / 2;
                        drawY = -height / 2;
                    } else {
                        drawWidth = width;
                        drawHeight = width / designAspect;
                        drawX = -width / 2;
                        drawY = -drawHeight / 2;
                    }

                    ctx.drawImage(designImg, drawX, drawY, drawWidth, drawHeight);

                    ctx.restore();

                    try {
                        resolve(canvas.toDataURL('image/png'));
                    } catch (e) {
                        console.error('Canvas export failed (likely CORS):', e);
                        reject(e);
                    }
                };

                designImg.onerror = () => reject('Failed to load design image');
                designImg.src = designUrl;
            };

            mockupImg.onerror = () => reject('Failed to load mockup image');
            mockupImg.src = mockupUrl;
        });
    };

    useEffect(() => {
        const load = async () => {
            if (!storeProductId) {
                setError('Missing storeProductId. Please go back to the design editor and try again.');
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const resp = await storeProductsApi.getById(storeProductId);
                if (resp && resp.success !== false) {
                    setStoreProduct(resp.data);
                } else {
                    setError('Failed to load store product');
                }
            } catch (e: any) {
                setError(e?.message || 'Failed to load store product');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [storeProductId]);

    useEffect(() => {
        const loadSampleMockups = async () => {
            if (!storeProduct?.catalogProductId) {
                return;
            }

            try {
                setIsLoadingMockups(true);
                const resp = await productApi.getById(storeProduct.catalogProductId);
                if (resp && resp.success !== false && resp.data) {
                    const catalogProduct = resp.data;

                    if (Array.isArray(catalogProduct.availableColors) && catalogProduct.availableColors.length > 0) {
                        setAvailableColors(catalogProduct.availableColors);
                    }

                    if (Array.isArray(catalogProduct.variants)) {
                        setVariants(catalogProduct.variants);
                    }

                    const productDesign = catalogProduct.design || {};
                    const mockups = productDesign.sampleMockups || [];
                    setSampleMockups(mockups);

                    const physDims = productDesign.physicalDimensions;
                    if (physDims) {
                        setCatalogPhysicalDimensions({
                            width: physDims.width || 20,
                            height: physDims.height || 24
                        });
                    } else {
                        setCatalogPhysicalDimensions({ width: 20, height: 24 });
                    }
                }
            } catch (e: any) {
                console.error('❌ Error loading sampleMockups from productcatalogs:', e);
            } finally {
                setIsLoadingMockups(false);
            }
        };

        if (storeProduct?.catalogProductId) {
            loadSampleMockups();
        }
    }, [storeProduct?.catalogProductId]);

    const designData = storeProduct?.designData || {};

    const placementsByView: Record<string, Record<string, DesignPlacement>> =
        (designData.placementsByView && typeof designData.placementsByView === 'object')
            ? designData.placementsByView
            : {};

    // Populate savedMockupUrls from server-generated modelMockups so
    // Continue button appears immediately without any save action needed.
    useEffect(() => {
        if (!storeProduct?.designData?.modelMockups) return;
        const modelMockups = storeProduct.designData.modelMockups as Record<string, Record<string, string>>;
        const flatUrls: Record<string, string> = {};
        for (const [colorKey, views] of Object.entries(modelMockups)) {
            for (const [viewKey, url] of Object.entries(views || {})) {
                if (url) flatUrls[`${colorKey}:${viewKey}`] = url;
            }
        }
        if (Object.keys(flatUrls).length > 0) {
            setSavedMockupUrls(flatUrls);
            setAllSaved(true);
            console.log('[MockupsLibrary] Loaded pre-generated mockups:', Object.keys(flatUrls).length);
        }
    }, [storeProduct?.designData?.modelMockups]);

    useEffect(() => {
        if (storeProduct?.designData) {
            const designData = storeProduct.designData;

            if (Array.isArray(designData.selectedColors)) {
                setSelectedColors(designData.selectedColors);
            } else if (state.selectedColors && Array.isArray(state.selectedColors)) {
                setSelectedColors(state.selectedColors);
            }

            if (Array.isArray(designData.selectedSizes)) {
                setSelectedSizes(designData.selectedSizes);
            } else if (state.selectedSizes && Array.isArray(state.selectedSizes)) {
                setSelectedSizes(state.selectedSizes);
            }

            if (designData.selectedSizesByColor && typeof designData.selectedSizesByColor === 'object') {
                setSelectedSizesByColor(designData.selectedSizesByColor);
            }

            if (typeof designData.primaryColorHex === 'string') {
                setPrimaryColorHex(designData.primaryColorHex);
            } else if (state.primaryColorHex && typeof state.primaryColorHex === 'string') {
                setPrimaryColorHex(state.primaryColorHex);
            }
        }
    }, [storeProduct?.designData, state.selectedColors, state.selectedSizes, state.primaryColorHex]);

    useEffect(() => {
        const colorsToUse = selectedColors.length > 0 ? selectedColors : availableColors;
        if (colorsToUse.length > 0 && !currentPreviewColor) {
            setCurrentPreviewColor(colorsToUse[0]);
        }
    }, [selectedColors, availableColors, currentPreviewColor]);

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

    const currentPreviewColorHex = currentPreviewColor ? getColorHex(currentPreviewColor) : null;

    const colorsToDisplay = selectedColors.length > 0 ? selectedColors : availableColors;

    const filteredMockups = useMemo(() => {
        let result = sampleMockups.filter((m: any) =>
            !m.colorKey ||
            (currentPreviewColor && m.colorKey === currentPreviewColor)
        );

        if (currentPreviewColor && variants.length > 0) {
            const activeVariant = variants.find((v: any) => v.color === currentPreviewColor);
            if (activeVariant && activeVariant.viewImages) {
                (['front', 'back', 'left', 'right'] as const).forEach((view) => {
                    const variantImageUrl = activeVariant.viewImages[view];
                    if (!variantImageUrl) return;

                    const hasMockup = result.some((m: any) => m.viewKey === view);

                    if (!hasMockup) {
                        const masterView = designData?.views?.find((v: any) => v.key === view);
                        const masterPlaceholders = masterView?.placeholders || [];

                        result.push({
                            id: `variant-${activeVariant.id}-${view}`,
                            viewKey: view,
                            colorKey: currentPreviewColor,
                            imageUrl: variantImageUrl,
                            placeholders: masterPlaceholders,
                            displacementSettings: null,
                            isVariantFallback: true
                        });
                    }
                });
            }
        }
        return result;
    }, [sampleMockups, currentPreviewColor, variants, designData]);

    const getMockupsForColor = useCallback((color: string) => {
        let result = sampleMockups.filter((m: any) =>
            !m.colorKey ||
            m.colorKey === color
        );

        if (variants.length > 0) {
            const activeVariant = variants.find((v: any) => v.color === color);
            if (activeVariant && activeVariant.viewImages) {
                (['front', 'back', 'left', 'right'] as const).forEach((view) => {
                    const variantImageUrl = activeVariant.viewImages[view];
                    if (!variantImageUrl) return;

                    const hasMockup = result.some((m: any) => m.viewKey === view);
                    if (!hasMockup) {
                        const masterView = designData?.views?.find((v: any) => v.key === view);
                        const masterPlaceholders = masterView?.placeholders || [];
                        result.push({
                            id: `variant-${activeVariant._id || activeVariant.id}-${view}-${color.replace(/\s+/g, '-')}`,
                            viewKey: view,
                            colorKey: color,
                            imageUrl: variantImageUrl,
                            placeholders: masterPlaceholders,
                            displacementSettings: null,
                            isVariantFallback: true
                        });
                    }
                });
            }
        }
        return result;
    }, [sampleMockups, variants, designData]);

    const allColorMockups = useMemo(() => {
        const colors = colorsToDisplay.length > 0 ? colorsToDisplay : [];
        return colors.map(color => ({
            color,
            colorHex: getColorHex(color),
            mockups: getMockupsForColor(color)
        }));
    }, [colorsToDisplay, getMockupsForColor, getColorHex]);

    const designImagesByView: Record<string, string> = (() => {
        const result: Record<string, string> = {};

        if (designData.views && typeof designData.views === 'object') {
            Object.keys(designData.views).forEach((viewKey) => {
                const normalizedKey = viewKey.toLowerCase();
                const viewData = designData.views[viewKey];
                if (viewData?.imageUrl) {
                    result[normalizedKey] = viewData.imageUrl;
                }
            });
        }

        if (designData.designUrlsByPlaceholder && typeof designData.designUrlsByPlaceholder === 'object') {
            Object.keys(designData.designUrlsByPlaceholder).forEach((viewKey) => {
                const normalizedKey = viewKey.toLowerCase();
                const viewDesigns = designData.designUrlsByPlaceholder[viewKey];
                if (viewDesigns && typeof viewDesigns === 'object') {
                    const urls = Object.values(viewDesigns);
                    if (urls.length > 0 && typeof urls[0] === 'string') {
                        result[normalizedKey] = urls[0] as string;
                    }
                }
            });
        }

        if (Array.isArray(designData.elements) && designData.elements.length > 0) {
            designData.elements.forEach((el: any) => {
                if (el?.type === 'image' && el?.imageUrl && el?.visible !== false) {
                    const viewKey = (el.view || 'front').toLowerCase();
                    if (!result[viewKey]) {
                        result[viewKey] = el.imageUrl;
                    }
                }
            });
        }

        if (designData.savedPreviewImages && typeof designData.savedPreviewImages === 'object') {
            Object.keys(designData.savedPreviewImages).forEach((viewKey) => {
                const normalizedKey = viewKey.toLowerCase();
                if (!result[normalizedKey] && designData.savedPreviewImages[viewKey]) {
                    result[normalizedKey] = designData.savedPreviewImages[viewKey];
                }
            });
        }

        return result;
    })();

    useEffect(() => {
        const generateAllPreviews = async () => {
            if (sampleMockups.length === 0) {
                return;
            }

            const hasDesignImages = Object.keys(designImagesByView).length > 0;
            if (!hasDesignImages) {
                return;
            }

            if (!catalogPhysicalDimensions) {
                return;
            }

            const tasks = sampleMockups.map(async (mockup) => {
                if (!mockup.id || !mockup.imageUrl) {
                    return;
                }

                const rawViewKey = mockup.viewKey || 'front';
                const viewKey = rawViewKey.toLowerCase();

                const designImageUrl = designImagesByView[viewKey];

                if (!designImageUrl) {
                    return;
                }

                const cacheKey = `${mockup.id}:${designImageUrl}`;
                if (previewCache.current[cacheKey]) {
                    setPreviewMap(prev => ({ ...prev, [mockup.id]: previewCache.current[cacheKey] }));
                    return;
                }

                if (generatingMap[mockup.id]) {
                    return;
                }

                try {
                    setGeneratingMap(prev => ({ ...prev, [mockup.id]: true }));

                    const placeholder = mockup.placeholders?.[0];
                    if (!placeholder) {
                        return;
                    }

                    const previewUrl = await generateMockupPreview(
                        mockup.imageUrl,
                        designImageUrl,
                        placeholder,
                        catalogPhysicalDimensions
                    );

                    previewCache.current[cacheKey] = previewUrl;
                    setPreviewMap(prev => ({ ...prev, [mockup.id]: previewUrl }));
                } catch (e) {
                    console.error(`❌ Failed to generate preview for mockup ${mockup.id}:`, e);
                } finally {
                    setGeneratingMap(prev => ({ ...prev, [mockup.id]: false }));
                }
            });

            await Promise.all(tasks);
        };

        generateAllPreviews();
    }, [sampleMockups, designImagesByView, catalogPhysicalDimensions]);

    const saveMockupPreview = useCallback(async (mockupId: string) => {
        try {
            const mockup = filteredMockups.find((m: any) => m.id === mockupId);
            if (!storeProductId || !mockup) return;

            const colorKey = (currentPreviewColor || 'default').toLowerCase().replace(/\s+/g, '-');
            const viewKey = (mockup.viewKey || 'front').toLowerCase();
            const mapKey = `${colorKey}:${viewKey}`;

            setSavingMockups(prev => ({ ...prev, [mapKey]: true }));

            // Re-trigger full server generation (simplest approach — regenerates all)
            const token = localStorage.getItem('token');
            const resp = await fetch(
                `${RAW_API_URL}/api/store-products/${storeProductId}/generate-mockups`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    credentials: 'include',
                }
            );
            const data = await resp.json();
            if (!data.success) throw new Error(data.message || 'Generation failed');

            const url = data.modelMockups?.[colorKey]?.[viewKey];
            if (url) {
                setSavedMockupUrls(prev => ({ ...prev, [mapKey]: url }));
                setAllSaved(true);
                toast.success(`Saved ${colorKey}/${viewKey}`);
            } else {
                toast.warning('Mockup generated but URL not found in response');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save preview');
        } finally {
            const mockup = filteredMockups.find((m: any) => m.id === mockupId);
            const colorKey = (currentPreviewColor || 'default').toLowerCase().replace(/\s+/g, '-');
            const viewKey = (mockup?.viewKey || 'front').toLowerCase();
            const mapKey = `${colorKey}:${viewKey}`;
            setSavingMockups(prev => ({ ...prev, [mapKey]: false }));
        }
    }, [storeProductId, filteredMockups, currentPreviewColor]);

    const saveAllMockupPreviews = useCallback(async () => {
        if (!storeProductId) { toast.error('No store product ID'); return; }
        setIsSavingAll(true);
        toast.info('Regenerating mockups on server...');
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${RAW_API_URL}/api/store-products/${storeProductId}/generate-mockups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });
            const data = await resp.json();
            if (!data.success) throw new Error(data.message || 'Generation failed');

            const flatUrls: Record<string, string> = {};
            for (const [colorKey, views] of Object.entries(
                data.modelMockups as Record<string, Record<string, string>>
            )) {
                for (const [viewKey, url] of Object.entries(views || {})) {
                    if (url) flatUrls[`${colorKey}:${viewKey}`] = url as string;
                }
            }
            setSavedMockupUrls(flatUrls);
            setAllSaved(true);
            toast.success(`All mockups regenerated!`);
        } catch (e: any) {
            toast.error(e.message || 'Failed to generate mockups');
        } finally {
            setIsSavingAll(false);
        }
    }, [storeProductId]);

    // const previewImagesByView: Record<string, string> = designData.previewImagesByView || {};

    const imageElements: Array<any> = Array.isArray(designData.elements)
        ? designData.elements.filter((el: any) => el?.type === 'image' && el?.imageUrl)
        : [];

    const uniqueDesignImages = useMemo(() => {
        const seenUrls = new Set<string>();
        return imageElements.filter(el => {
            if (!el.imageUrl || seenUrls.has(el.imageUrl)) return false;
            seenUrls.add(el.imageUrl);
            return true;
        });
    }, [imageElements]);

    // Calculate total mockups across all colors
    const totalMockups = allColorMockups.reduce((sum, { mockups }) => {
        return sum + mockups.length;
    }, 0);
    const savedCount = Object.keys(savedMockupUrls).length;
    const saveProgress = totalMockups > 0 ? (savedCount / totalMockups) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Animated Background Pattern */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                                Mockups Library
                            </h1>
                            <p className="text-slate-600 text-sm">
                                Your design is ready! Preview and save professional mockups for your products
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                if (state.productId) {
                                    navigate(`/designer/${state.productId}`);
                                } else {
                                    navigate(-1);
                                }
                            }}
                            className="bg-[#1a1c0e] hover:bg-[#2a2d18] text-white px-6 py-2 rounded-md font-semibold transition-all shadow-sm hover:shadow-md h-auto"
                        >
                            Edit design
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    {totalMockups > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-slate-700">Mockup Generation Progress</span>
                                <span className="text-sm font-bold text-primary">{savedCount}/{totalMockups} saved</span>
                            </div>
                            <Progress value={saveProgress} className="h-2" />
                        </div>
                    )}
                </div>

                {error && (
                    <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-3 pb-3">
                            <CardTitle className="text-base text-red-900">Error Loading Mockups</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-red-700">{error}</CardContent>
                    </Card>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary"></div>
                            <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="mt-4 text-slate-600 font-medium">Loading your design...</p>
                    </div>
                )}

                {!isLoading && !error && storeProduct && (
                    <div className="space-y-8">
                        {/* Design Previews Section */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden mb-8">
                            <CardHeader className="pb-4 bg-white border-b border-slate-100">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800">Your Design</CardTitle>
                                    <CardDescription className="text-xs mt-1 text-slate-500">
                                        The artwork that will appear on your products
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8">
                                {uniqueDesignImages.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {uniqueDesignImages.map((el, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative"
                                            >
                                                <div className="w-40 h-40 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                                                    <div className="w-full h-full flex items-center justify-center p-4">
                                                        <img
                                                            src={el.imageUrl}
                                                            alt={`Design ${idx + 1}`}
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-12 text-center">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-600 mb-1">No design preview available</p>
                                        <p className="text-xs text-slate-500">Your design will appear here once generated</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mockups Section */}
                        <Card className="border-slate-200/60 shadow-lg overflow-hidden">
                            <CardHeader className="pb-4 bg-white border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <CardTitle className="text-lg">Realistic Mockup Previews</CardTitle>
                                            <CardDescription className="text-xs mt-1">
                                                AI-powered WebGL rendering • {allColorMockups.length} color variant{allColorMockups.length !== 1 ? 's' : ''} • {totalMockups} total mockup{totalMockups !== 1 ? 's' : ''}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {allColorMockups.length > 0 && Object.keys(designImagesByView).length > 0 && (
                                        <Button
                                            onClick={saveAllMockupPreviews}
                                            disabled={isSavingAll || allSaved}
                                            size="lg"
                                            className={cn(
                                                "gap-2 px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
                                                allSaved
                                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                                    : "bg-gradient-to-r from-primary to-primary/80"
                                            )}
                                        >
                                            {isSavingAll ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving All...
                                                </>
                                            ) : allSaved ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    All Saved!
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save All Previews
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-8">
                                {isLoadingMockups ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="relative">
                                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary"></div>
                                            <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                        </div>
                                        <p className="mt-4 text-slate-600 font-medium">Generating realistic mockups...</p>
                                        <p className="mt-1 text-xs text-slate-500">This may take a moment</p>
                                    </div>
                                ) : allColorMockups.length > 0 ? (
                                    <div className="space-y-12">
                                        {/* Color Tab Bar */}
                                        {allColorMockups.length > 0 && (
                                            <div className="flex items-center border-b border-slate-100 -mx-8 px-8 mt-4 overflow-x-auto no-scrollbar">
                                                {allColorMockups.map(({ color, colorHex }) => {
                                                    const isActive = currentPreviewColor === color;
                                                    const count = getMockupsForColor(color).length;
                                                    return (
                                                        <button
                                                            key={color}
                                                            onClick={() => setCurrentPreviewColor(color)}
                                                            className={cn(
                                                                "flex items-center gap-2.5 px-5 py-3 text-sm font-semibold",
                                                                "whitespace-nowrap border-b-2 transition-all duration-200 flex-shrink-0",
                                                                isActive
                                                                    ? "border-primary text-primary"
                                                                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all",
                                                                    isActive ? "border-primary scale-110 shadow-sm" : "border-slate-200"
                                                                )}
                                                                style={{ backgroundColor: colorHex }}
                                                            />
                                                            <span className="capitalize">{color}</span>
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center transition-colors",
                                                                isActive
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "bg-slate-100 text-slate-500"
                                                            )}>
                                                                {count}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {(() => {
                                            const activeColorData = allColorMockups.find(
                                                ({ color }) => color === currentPreviewColor
                                            );

                                            if (!activeColorData) return (
                                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                                    <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                                                    <p className="text-sm font-medium">Select a color tab above to preview mockups</p>
                                                </div>
                                            );

                                            const { color, mockups: displayMockups } = activeColorData;

                                            if (displayMockups.length === 0) return (
                                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                                    <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                                                    <p className="text-sm font-medium">No mockups available for {color}</p>
                                                </div>
                                            );

                                            const normalizedColorKey = (color || 'default').toLowerCase().replace(/\s+/g, '-');

                                            return (
                                                <div
                                                    className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300"
                                                    key={color}
                                                >
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {displayMockups.map((mockup: any, index: number) => {
                                                            const viewKey = (mockup.viewKey || 'front').toLowerCase();
                                                            const hasPlaceholder = Array.isArray(mockup.placeholders) && mockup.placeholders.length > 0;
                                                            const mapKey = `${normalizedColorKey}:${viewKey}`;
                                                            const isSaving = savingMockups[mapKey];
                                                            const isSaved = !!savedMockupUrls[mapKey];
                                                            const mockupDisplacement: DisplacementSettings =
                                                                mockup.displacementSettings || displacementSettings || defaultDisplacementSettings;

                                                            const mockupDesignUrls: Record<string, string> = {};
                                                            const mockupPlacements: Record<string, DesignPlacement> = {};
                                                            const hasCanvasElements = Array.isArray(designData.elements) &&
                                                                designData.elements.some((el: any) => !el.view || el.view === viewKey);

                                                            if (!hasCanvasElements && designImagesByView[viewKey]) {
                                                                const viewPlacements = placementsByView[viewKey] || {};
                                                                mockup.placeholders?.forEach((ph: any, idx: number) => {
                                                                    if (ph.id) {
                                                                        mockupDesignUrls[ph.id] = designImagesByView[viewKey];
                                                                        // Look up placement by placeholderId key directly
                                                                        const savedPlacement = viewPlacements[ph.id];
                                                                        if (savedPlacement) {
                                                                            mockupPlacements[ph.id] = {
                                                                                ...savedPlacement,
                                                                                placeholderId: ph.id,
                                                                            };
                                                                        }
                                                                    }
                                                                });
                                                            }

                                                            const savedUrl = savedMockupUrls[mapKey];

                                                            return (
                                                                <div
                                                                    key={mapKey || index}
                                                                    className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                                                                >
                                                                    {/* View label + save button */}
                                                                    <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                                                        <span className="text-[10px] uppercase font-bold tracking-wider bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded text-slate-600 capitalize">
                                                                            {viewKey}
                                                                        </span>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-7 px-3 w-auto rounded-md bg-white/95 border border-slate-100 shadow-sm pointer-events-auto hover:bg-slate-50"
                                                                            onClick={() => saveMockupPreview(mockup.id)}
                                                                            disabled={isSaving || isSaved}
                                                                        >
                                                                            {isSaving ? (
                                                                                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                                                            ) : isSaved ? (
                                                                                <Check className="h-3 w-3 text-emerald-500" />
                                                                            ) : (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Save className="h-3 w-3 text-slate-400" />
                                                                                    <span className="text-[10px] font-bold text-slate-500">Save</span>
                                                                                </div>
                                                                            )}
                                                                        </Button>
                                                                    </div>

                                                                    {/* Saved badge */}
                                                                    {isSaved && (
                                                                        <div className="absolute bottom-3 left-3 z-20 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                                                            <Check className="h-3 w-3" />
                                                                            Saved
                                                                        </div>
                                                                    )}

                                                                    {/* Mockup image — show server-saved URL if available, else WebGL preview */}
                                                                    <div className="aspect-[4/3] relative bg-white overflow-hidden">
                                                                        {savedUrl ? (
                                                                            <img
                                                                                src={savedUrl}
                                                                                alt={`${color} ${viewKey} mockup`}
                                                                                className="w-full h-full object-contain"
                                                                            />
                                                                        ) : mockup.imageUrl && hasPlaceholder && catalogPhysicalDimensions ? (
                                                                            <div className="relative w-full h-full">
                                                                                <RealisticWebGLPreview
                                                                                    key={`webgl-${mapKey}-${designImagesByView[viewKey]?.slice(-20) || ''}`}
                                                                                    mockupImageUrl={mockup.imageUrl}
                                                                                    activePlaceholder={null}
                                                                                    placeholders={(mockup.placeholders || []).map((p: any) => ({
                                                                                        ...p,
                                                                                        rotationDeg: p.rotationDeg ?? 0,
                                                                                    }))}
                                                                                    physicalWidth={catalogPhysicalDimensions.width}
                                                                                    physicalHeight={catalogPhysicalDimensions.height}
                                                                                    settings={mockupDisplacement}
                                                                                    onSettingsChange={(settings) => {
                                                                                        sampleMockups.forEach((m) => {
                                                                                            if (m.id === mockup.id) m.displacementSettings = settings;
                                                                                        });
                                                                                    }}
                                                                                    designUrlsByPlaceholder={mockupDesignUrls}
                                                                                    designPlacements={mockupPlacements}
                                                                                    previewMode={true}
                                                                                    currentView={viewKey}
                                                                                    canvasPadding={40}
                                                                                    PX_PER_INCH={Math.min(
                                                                                        720 / catalogPhysicalDimensions.width,
                                                                                        520 / catalogPhysicalDimensions.height
                                                                                    )}
                                                                                    onLoad={() => { }}
                                                                                    canvasElements={designData.elements || []}
                                                                                    editorPlaceholders={(() => {
                                                                                        const masterView = designData.views?.find((v: any) => v.key === viewKey);
                                                                                        return masterView?.placeholders || [];
                                                                                    })()}
                                                                                />
                                                                            </div>
                                                                        ) : mockup.imageUrl ? (
                                                                            <img
                                                                                src={mockup.imageUrl}
                                                                                alt="Mockup"
                                                                                className="w-full h-full object-cover"
                                                                                crossOrigin="anonymous"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                                                                                <ImageIcon className="h-8 w-8 opacity-20" />
                                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Missing</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : storeProduct.catalogProductId ? (
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-16 text-center">
                                        <div className="max-w-md mx-auto">
                                            <ImageIcon className="h-16 w-16 mx-auto mb-6 text-slate-400" />
                                            <h4 className="text-lg font-bold text-slate-700 mb-2">No Sample Mockups Found</h4>
                                            <p className="text-sm text-slate-600">
                                                The product catalog doesn't have sample mockups configured for this item yet.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-12 text-center">
                                        <p className="text-sm text-slate-600">No catalog product ID available to fetch sample mockups.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CTA Button */}
                        {
                            allColorMockups.length > 0 && Object.keys(savedMockupUrls).length > 0 && (
                                <div className="flex justify-end pt-8 pb-12">
                                    <Button
                                        size="lg"
                                        className="px-10 py-6 text-lg font-bold gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/80"
                                        onClick={() => {
                                            navigate('/listing-editor', {
                                                state: {
                                                    ...state,
                                                    storeProductId,
                                                    savedMockupUrls,
                                                },
                                            });
                                        }}
                                    >
                                        Continue
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                )
                }

                {
                    !isLoading && !error && !storeProduct && (
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-20 text-center">
                            <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No Store Product Loaded</h3>
                            <p className="text-sm text-slate-600">Please go back to the design editor and try again.</p>
                        </div>
                    )
                }
            </main >
        </div >
    );
};

export default MockupsLibrary;