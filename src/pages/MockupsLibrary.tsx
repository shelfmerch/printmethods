import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Shape } from 'react-konva';
import { productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Check, Loader2, Sparkles, ChevronRight, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithApiAuth } from '@/lib/api';
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

const normalizeColorKey = (c: string) => c.toLowerCase().replace(/\s+/g, '-');

/** Load an HTMLImageElement, trying crossOrigin first then falling back. */
function useKonvaImage(url: string | undefined) {
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    useEffect(() => {
        if (!url) { setImg(null); return; }
        let cancelled = false;
        const load = (crossOrigin: boolean) => {
            const el = new window.Image();
            if (crossOrigin) el.crossOrigin = 'anonymous';
            el.onload  = () => { if (!cancelled) setImg(el); };
            el.onerror = () => { if (!cancelled && crossOrigin) load(false); };
            el.src = url;
        };
        load(true);
        return () => { cancelled = true; };
    }, [url]);
    return img;
}

/** Compute letter-box rect (object-fit: contain) for an image inside a container. */
function letterBox(
    img: HTMLImageElement | null,
    stage: { width: number; height: number },
) {
    if (!img || !stage.width || !stage.height) return null;
    const scale = Math.min(stage.width / img.naturalWidth, stage.height / img.naturalHeight);
    const w = img.naturalWidth  * scale;
    const h = img.naturalHeight * scale;
    return { x: (stage.width - w) / 2, y: (stage.height - h) / 2, w, h };
}

/**
 * Renders a mockup through a Konva Stage using the SAME 3-layer pipeline
 * as the DesignEditor Preview tab:
 *
 *   Layer 1  — server-composited mockup (garment + design already merged by server)
 *   Layer 2  — realism passes driven by the REAL garment-only image (mockup.imageUrl):
 *               Pass 1  multiply  @ 0.20  garment colour/shadows bleed through design
 *               Pass 2  soft-light @ 0.18 surface sheen and highlights
 *
 * DesignEditor does:  garment-base + design-elements + garment-multiply/soft-light
 * MockupsLibrary does: composite   +                  garment-multiply/soft-light
 *
 * By driving the blend passes with the separate garment image (not self-blending
 * the composite) we get the same "fabric bleeds through print" realism.
 * Falls back to self-blend when garmentSrc is unavailable.
 */
const MockupKonva = ({
    src,
    garmentSrc,
    alt,
    className,
}: {
    src: string;
    garmentSrc?: string;
    alt: string;
    className?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

    const compositeImg = useKonvaImage(src);
    // Use real garment image when available; fall back to composite for self-blend
    const garmentImg   = useKonvaImage(garmentSrc || src);

    // Measure container via ResizeObserver
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setStageSize({ width, height });
        });
        ro.observe(el);
        setStageSize({ width: el.offsetWidth, height: el.offsetHeight });
        return () => ro.disconnect();
    }, []);

    const compositeRect = useMemo(() => letterBox(compositeImg, stageSize), [compositeImg, stageSize]);
    const garmentRect   = useMemo(() => letterBox(garmentImg,   stageSize), [garmentImg,   stageSize]);

    return (
        <div ref={containerRef} className={className} aria-label={alt} style={{ width: '100%', height: '100%' }}>
            {stageSize.width > 0 && stageSize.height > 0 && (
                <Stage width={stageSize.width} height={stageSize.height}>

                    {/* Layer 1 — server-composited mockup (garment + design) */}
                    <Layer>
                        {compositeImg && compositeRect && (
                            <KonvaImage
                                image={compositeImg}
                                x={compositeRect.x}
                                y={compositeRect.y}
                                width={compositeRect.w}
                                height={compositeRect.h}
                            />
                        )}
                    </Layer>

                    {/* Layer 2 — realism passes using the real garment-only image,
                        identical sceneFunc structure to DesignEditorPage.tsx */}
                    {garmentImg && garmentRect && (
                        <Layer listening={false}>
                            {/* Pass 1 — multiply: garment colour and shadows bleed through the design */}
                            <Shape
                                sceneFunc={(ctx, shape) => {
                                    ctx.save();
                                    ctx.globalCompositeOperation = 'multiply';
                                    ctx.globalAlpha = 0.20;
                                    ctx.drawImage(garmentImg, garmentRect.x, garmentRect.y, garmentRect.w, garmentRect.h);
                                    ctx.restore();
                                    ctx.fillStrokeShape(shape);
                                }}
                                fill="transparent"
                                perfectDrawEnabled={false}
                            />
                            {/* Pass 2 — soft-light: surface sheen and highlights */}
                            <Shape
                                sceneFunc={(ctx, shape) => {
                                    ctx.save();
                                    ctx.globalCompositeOperation = 'soft-light';
                                    ctx.globalAlpha = 0.18;
                                    ctx.drawImage(garmentImg, garmentRect.x, garmentRect.y, garmentRect.w, garmentRect.h);
                                    ctx.restore();
                                    ctx.fillStrokeShape(shape);
                                }}
                                fill="transparent"
                                perfectDrawEnabled={false}
                            />
                        </Layer>
                    )}

                </Stage>
            )}
        </div>
    );
};

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
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

    // colorKey → { front?: url, back?: url, ... }
    const [rowImages, setRowImages] = useState<Record<string, Record<string, string>>>({});
    // colors currently being generated on the server
    const [generatingColors, setGeneratingColors] = useState<Set<string>>(new Set());
    // colors that have been requested at least once
    const requestedRef = useRef<Set<string>>(new Set());

    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedSizesByColor, setSelectedSizesByColor] = useState<Record<string, string[]>>({});
    const [primaryColorHex, setPrimaryColorHex] = useState<string | null>(null);
    const [availableColors, setAvailableColors] = useState<string[]>([]);

    // ─── Load store product ───────────────────────────────────────────────────
    useEffect(() => {
        if (!storeProductId) {
            setError('Missing storeProductId. Please go back to the design editor and try again.');
            return;
        }
        const load = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const resp = await fetchWithApiAuth(`/storeproducts/${storeProductId}`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                    credentials: 'include',
                });
                if (!resp.ok) { setError('Failed to load store product'); return; }
                const data = await resp.json().catch(() => null);
                if (data?.success && data?.data) setStoreProduct(data.data);
                else setError('Failed to load store product');
            } catch (e: any) {
                setError(e?.message || 'Failed to load store product');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [storeProductId]);

    // ─── Load catalog data (sampleMockups, variants) ─────────────────────────
    useEffect(() => {
        if (!storeProduct?.catalogProductId) return;
        const load = async () => {
            try {
                setIsLoadingCatalog(true);
                const resp = await productApi.getById(storeProduct.catalogProductId);
                if (resp?.success !== false && resp?.data) {
                    const cat = resp.data;
                    if (Array.isArray(cat.availableColors)) setAvailableColors(cat.availableColors);
                    if (Array.isArray(cat.variants)) setVariants(cat.variants);
                    setSampleMockups(cat.design?.sampleMockups || []);
                }
            } catch (e: any) {
                console.error('Error loading catalog:', e);
            } finally {
                setIsLoadingCatalog(false);
            }
        };
        load();
    }, [storeProduct?.catalogProductId]);

    // ─── Seed rowImages from already-generated modelMockups in DB ────────────
    useEffect(() => {
        const mm = storeProduct?.designData?.modelMockups;
        if (!mm || typeof mm !== 'object') return;
        setRowImages(prev => {
            const next = { ...prev };
            for (const [ck, views] of Object.entries(mm as Record<string, Record<string, string>>)) {
                if (views && typeof views === 'object') {
                    next[ck] = { ...(next[ck] || {}), ...views };
                }
            }
            return next;
        });
    }, [storeProduct?.designData?.modelMockups]);

    // ─── Populate selectedColors / sizes from designData ─────────────────────
    useEffect(() => {
        const dd = storeProduct?.designData;
        if (!dd) return;
        if (Array.isArray(dd.selectedColors)) setSelectedColors(dd.selectedColors);
        else if (Array.isArray(state.selectedColors)) setSelectedColors(state.selectedColors);
        if (Array.isArray(dd.selectedSizes)) setSelectedSizes(dd.selectedSizes);
        if (dd.selectedSizesByColor) setSelectedSizesByColor(dd.selectedSizesByColor);
        if (typeof dd.primaryColorHex === 'string') setPrimaryColorHex(dd.primaryColorHex);
        else if (state.primaryColorHex) setPrimaryColorHex(state.primaryColorHex);
    }, [storeProduct?.designData, state.selectedColors, state.selectedSizes, state.primaryColorHex]);

    // ─── Color display helpers ────────────────────────────────────────────────
    const COLOR_MAP: Record<string, string> = {
        black: '#000000', white: '#FFFFFF', red: '#FF0000', blue: '#0000FF',
        green: '#008000', yellow: '#FFFF00', orange: '#FFA500', purple: '#800080',
        pink: '#FFC0CB', brown: '#A52A2A', grey: '#808080', gray: '#808080',
        navy: '#000080', maroon: '#800000', olive: '#808000', lime: '#00FF00',
        aqua: '#00FFFF', teal: '#008080', silver: '#C0C0C0', gold: '#FFD700',
        beige: '#F5F5DC', tan: '#D2B48C', khaki: '#F0E68C', coral: '#FF7F50',
        salmon: '#FA8072', turquoise: '#40E0D0', lavender: '#E6E6FA', ivory: '#FFFFF0',
        cream: '#FFFDD0', mint: '#98FF98', peach: '#FFE5B4',
        'cerulean frost': '#6D9BC3', cerulean: '#6D9BC3', 'cobalt blue': '#0047AB',
        amber: '#FFBF00', frosted: '#E8E8E8', natural: '#FAF0E6',
        'heather red': '#C0524A', 'heather grey': '#A0A0A0', 'heather gray': '#A0A0A0',
        kraft: '#D4A574',
    };
    const getColorHex = (name: string) => COLOR_MAP[name.toLowerCase().trim()] || '#CCCCCC';

    // ─── Build per-color mockup list ──────────────────────────────────────────
    const designData = storeProduct?.designData || {};
    const colorsToDisplay = selectedColors.length > 0 ? selectedColors : availableColors;

    const getMockupsForColor = useCallback((color: string) => {
        const result = sampleMockups.filter((m: any) => !m.colorKey || m.colorKey === color);
        const activeVariant = variants.find((v: any) => v.color === color);
        if (activeVariant?.viewImages) {
            (['front', 'back', 'left', 'right'] as const).forEach(view => {
                const url = activeVariant.viewImages[view];
                if (!url) return;
                if (result.some((m: any) => m.viewKey === view)) return;
                const masterView = designData?.views?.find((v: any) => v.key === view);
                result.push({
                    id: `variant-${activeVariant._id || activeVariant.id}-${view}-${normalizeColorKey(color)}`,
                    viewKey: view,
                    colorKey: color,
                    imageUrl: url,
                    placeholders: masterView?.placeholders || [],
                });
            });
        }
        return result;
    }, [sampleMockups, variants, designData]);

    const allColorMockups = useMemo(() =>
        colorsToDisplay.map(color => ({
            color,
            colorHex: getColorHex(color),
            colorKey: normalizeColorKey(color),
            mockups: getMockupsForColor(color),
        })),
        [colorsToDisplay, getMockupsForColor]
    );

    // ─── Derived counts ───────────────────────────────────────────────────────
    const totalMockups = allColorMockups.reduce((s, { mockups }) => s + mockups.length, 0);

    const savedCount = useMemo(() =>
        Object.values(rowImages).reduce((s, views) => s + Object.keys(views).length, 0),
        [rowImages]
    );

    const allMockupsReady = totalMockups > 0 && savedCount >= totalMockups;

    const isRowReady = (ck: string, expectedCount: number) =>
        Object.keys(rowImages[ck] || {}).length >= expectedCount;

    // ─── Trigger server-side generation for one color ─────────────────────────
    const triggerColorGeneration = useCallback(async (colorKey: string) => {
        if (!storeProductId) return;
        setGeneratingColors(prev => new Set([...prev, colorKey]));
        try {
            const resp = await fetchWithApiAuth(
                `/storeproducts/${storeProductId}/generate-mockups`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        colorFilter: colorKey,
                        designOnlyImages: designData.designOnlyImages || {},
                    }),
                }
            );
            if (!resp.ok) {
                console.error(`[generate-mockups] HTTP ${resp.status} for ${colorKey}`);
                return;
            }
            const data = await resp.json().catch(() => null);
            if (!data?.success || !data?.modelMockups) return;

            // Update rowImages with every color returned (server returns full modelMockups)
            setRowImages(prev => {
                const next = { ...prev };
                for (const [ck, views] of Object.entries(
                    data.modelMockups as Record<string, Record<string, string>>
                )) {
                    if (views && typeof views === 'object') {
                        next[ck] = { ...(next[ck] || {}), ...views };
                    }
                }
                return next;
            });
        } catch (e) {
            console.error(`[triggerColorGeneration] failed for ${colorKey}:`, e);
            toast.error(`Failed to generate mockups for ${colorKey}`);
        } finally {
            setGeneratingColors(prev => {
                const next = new Set(prev);
                next.delete(colorKey);
                return next;
            });
        }
    }, [storeProductId, designData.designOnlyImages]);

    // ─── Sequential lazy trigger ──────────────────────────────────────────────
    // Fires generation one color row at a time.
    // The next color only starts after the current one completes (generatingColors is empty for it).
    useEffect(() => {
        if (!storeProductId || allColorMockups.length === 0) return;
        // If any color is currently generating, wait for it to finish
        if (generatingColors.size > 0) return;

        for (const { colorKey, mockups } of allColorMockups) {
            if (isRowReady(colorKey, mockups.length)) continue; // done
            if (requestedRef.current.has(colorKey)) continue;   // already requested, not generating = failed, skip
            // First color that needs generation and hasn't been requested yet
            requestedRef.current.add(colorKey);
            triggerColorGeneration(colorKey);
            return; // only one at a time
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allColorMockups, rowImages, generatingColors, storeProductId, triggerColorGeneration]);

    // ─── Retry a single color row ─────────────────────────────────────────────
    const retryColor = useCallback((colorKey: string) => {
        requestedRef.current.delete(colorKey);
        setGeneratingColors(prev => {
            const next = new Set(prev);
            next.delete(colorKey);
            return next;
        });
        requestedRef.current.add(colorKey);
        triggerColorGeneration(colorKey);
    }, [triggerColorGeneration]);

    const saveProgress = totalMockups > 0 ? (savedCount / totalMockups) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                                Mockups Library
                            </h1>
                            <p className="text-slate-600 text-sm">
                                Server-rendered mockups are generating color by color. Each row appears when all views are ready.
                            </p>
                        </div>
                        <Button
                            onClick={() => state.productId ? navigate(`/designer/${state.productId}`) : navigate(-1)}
                            className="bg-[#1a1c0e] hover:bg-[#2a2d18] text-white px-6 py-2 rounded-md font-semibold transition-all shadow-sm hover:shadow-md h-auto"
                        >
                            Edit design
                        </Button>
                    </div>

                    {/* Progress bar */}
                    {totalMockups > 0 && (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-700">Generation Progress</span>
                                <span className="text-sm font-bold text-primary">{savedCount} / {totalMockups}</span>
                            </div>
                            <Progress value={saveProgress} className="h-2" />
                            {generatingColors.size > 0 && (
                                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Generating: {[...generatingColors].join(', ')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary" />
                            <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="mt-4 text-slate-600 font-medium">Loading your design...</p>
                    </div>
                )}

                {!isLoading && !error && !storeProduct && (
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-20 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No Store Product Loaded</h3>
                        <p className="text-sm text-slate-600">Please go back to the design editor and try again.</p>
                    </div>
                )}

                {!isLoading && !error && storeProduct && (
                    <div className="space-y-8">
                        <Card className="border-slate-200/60 shadow-lg overflow-hidden">
                            <CardHeader className="pb-4 bg-white border-b border-slate-100">
                                <CardTitle className="text-lg">Mockup Previews</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    {allColorMockups.length} color variant{allColorMockups.length !== 1 ? 's' : ''} · {totalMockups} total mockup{totalMockups !== 1 ? 's' : ''} · generating row by row
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-8">
                                {isLoadingCatalog ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary" />
                                        <p className="mt-4 text-slate-600 font-medium">Loading product data…</p>
                                    </div>
                                ) : allColorMockups.length > 0 ? (
                                    <div className="space-y-10">
                                        {/* Color jump bar */}
                                        <div className="sticky top-0 z-30 -mx-2 px-2 py-2 bg-white/90 backdrop-blur-md border border-slate-100 rounded-xl shadow-sm flex flex-wrap gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center mr-1">Jump:</span>
                                            {allColorMockups.map(({ color, colorHex, colorKey, mockups }) => {
                                                const ready = isRowReady(colorKey, mockups.length);
                                                const generating = generatingColors.has(colorKey);
                                                return (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => document.getElementById(`row-${colorKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                                                    >
                                                        <span className="w-3 h-3 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: colorHex }} />
                                                        <span className="capitalize">{color}</span>
                                                        {ready && <Check className="h-3 w-3 text-emerald-500" />}
                                                        {generating && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Color rows */}
                                        {allColorMockups.map(({ color, colorHex, colorKey, mockups: displayMockups }) => {
                                            const rowReady = isRowReady(colorKey, displayMockups.length);
                                            const isGenerating = generatingColors.has(colorKey);
                                            const isPending = !rowReady && !isGenerating;
                                            const views = rowImages[colorKey] || {};

                                            return (
                                                <section
                                                    key={colorKey}
                                                    id={`row-${colorKey}`}
                                                    className="scroll-mt-28 space-y-4 pb-10 border-b border-slate-100 last:border-0 last:pb-0"
                                                >
                                                    {/* Row header */}
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span
                                                            className="w-9 h-9 rounded-full border-2 border-white shadow ring-2 ring-slate-200 shrink-0"
                                                            style={{ backgroundColor: colorHex }}
                                                        />
                                                        <h3 className="text-lg font-bold text-slate-800 capitalize">{color}</h3>
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {displayMockups.length} view{displayMockups.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                        {rowReady && (
                                                            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
                                                                <Check className="h-3 w-3 mr-1" /> Ready
                                                            </Badge>
                                                        )}
                                                        {isGenerating && (
                                                            <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating…
                                                            </Badge>
                                                        )}
                                                        {/* Retry button if row was requested but failed (not generating, not ready) */}
                                                        {!rowReady && !isGenerating && requestedRef.current.has(colorKey) && (
                                                            <button
                                                                onClick={() => retryColor(colorKey)}
                                                                className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                                                            >
                                                                <RefreshCw className="h-3 w-3" /> Retry
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* View grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {displayMockups.map((mockup: any, idx: number) => {
                                                            const viewKey = (mockup.viewKey || 'front').toLowerCase();
                                                            const imgUrl = views[viewKey];

                                                            return (
                                                                <div
                                                                    key={`${colorKey}:${viewKey}:${idx}`}
                                                                    className="relative bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                                                                >
                                                                    {/* View label */}
                                                                    <div className="absolute top-3 left-3 z-10">
                                                                        <span className="text-[10px] uppercase font-bold tracking-wider bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded text-slate-600 capitalize">
                                                                            {viewKey}
                                                                        </span>
                                                                    </div>

                                                                    {/* Done badge */}
                                                                    {imgUrl && (
                                                                        <div className="absolute bottom-3 left-3 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                            <Check className="h-3 w-3" /> Saved
                                                                        </div>
                                                                    )}

                                                    <div className="aspect-[4/3] relative bg-white overflow-hidden">
                                                        {imgUrl ? (
                                                            <MockupKonva
                                                                src={imgUrl}
                                                                garmentSrc={mockup.imageUrl}
                                                                alt={`${color} ${viewKey}`}
                                                                className="w-full h-full"
                                                            />
                                                        ) : (
                                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
                                                                                {isGenerating ? (
                                                                                    <>
                                                                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary" />
                                                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                                                            Generating…
                                                                                        </span>
                                                                                    </>
                                                                                ) : isPending ? (
                                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                                                                        Queued
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                                                                        Pending retry
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </section>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-16 text-center">
                                        <p className="text-sm text-slate-600">No mockup templates found for this product.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status footer */}
                        {totalMockups > 0 && !allMockupsReady && (
                            <p className="text-center text-sm text-slate-500 py-4">
                                <strong>{savedCount}/{totalMockups}</strong> mockups ready — generating row by row…
                            </p>
                        )}

                        {/* Continue — only unlocks when every slot is filled */}
                        {allMockupsReady && (
                            <div className="flex justify-end pt-6 pb-12">
                                <Button
                                    size="lg"
                                    className="px-10 py-6 text-lg font-bold gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/80"
                                    onClick={() => {
                                        // Flatten rowImages { colorKey: { viewKey: url } } → { "colorKey:viewKey": url }
                                        const savedMockupUrls: Record<string, string> = {};
                                        for (const [ck, views] of Object.entries(rowImages)) {
                                            for (const [vk, url] of Object.entries(views)) {
                                                savedMockupUrls[`${ck}:${vk}`] = url;
                                            }
                                        }
                                        navigate('/listing-editor', { state: { ...state, storeProductId, savedMockupUrls } });
                                    }}
                                >
                                    Continue <ChevronRight className="h-6 w-6" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MockupsLibrary;
