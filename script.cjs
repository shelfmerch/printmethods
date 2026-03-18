const fs = require('fs');
const path = require('path');

const filePath = path.resolve('d:/shelfmerch/shelfmerch-printify-clone/src/pages/MockupsLibrary.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove references to webglContainerRefs, hasAutoSaved, etc.
content = content.replace(
  /const webglContainerRefs = useRef<Record<string, HTMLDivElement \| null>>\(\{\}\);\n?\s*const \[savedMockupUrls, setSavedMockupUrls\] = useState<Record<string, string>>\(\{\}\);\n?\s*const \[savingMockups, setSavingMockups\] = useState<Record<string, boolean>>\(\{\}\);\n?\s*const \[allSaved, setAllSaved\] = useState\(false\);\n?\s*const \[isSavingAll, setIsSavingAll\] = useState\(false\);\n?\s*const \[hasAutoSaved, setHasAutoSaved\] = useState\(false\);\n?\s*const \[webglReadyMap, setWebglReadyMap\] = useState<Record<string, boolean>>\(\{\}\);/g,
  `const [savedMockupUrls, setSavedMockupUrls] = useState<Record<string, string>>({});
    const [savingMockups, setSavingMockups] = useState<Record<string, boolean>>({});
    const [isSavingAll, setIsSavingAll] = useState(false);`
);

// 2. Add useEffect for storeProduct.designData.modelMockups mapping
const useEffectStoreProduct = `
    useEffect(() => {
        if (storeProduct?.designData?.modelMockups) {
            const serverMockups = storeProduct.designData.modelMockups;
            const newSaved: Record<string, string> = {};
            Object.keys(serverMockups).forEach(color => {
                const views = serverMockups[color];
                if (views) {
                    Object.keys(views).forEach(view => {
                        const url = views[view];
                        if (url) {
                            newSaved[\`\${color.toLowerCase()}-\${view.toLowerCase()}\`] = url;
                        }
                    });
                }
            });
            setSavedMockupUrls(newSaved);
        }
    }, [storeProduct]);
`;
content = content.replace(
  /const designData = storeProduct\?\.designData \|\| \{\};/,
  `${useEffectStoreProduct}\n    const designData = storeProduct?.designData || {};`
);

// 3. Replace captureWebGLPreview, saveMockupPreview, saveAllMockupPreviews, handleWebGLReady, and useEffect hasAutoSaved
const startCapture = content.indexOf('const captureWebGLPreview = useCallback(async (mockupId: string)');
const endEffect = content.indexOf('// const previewImagesByView');
if (startCapture !== -1 && endEffect !== -1) {
  content = content.substring(0, startCapture) + 
`    const saveAllMockupPreviews = async () => {
        if (!storeProductId) return;
        setIsSavingAll(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(\`\${RAW_API_URL}/api/storeproducts/\${storeProductId}/generate-mockups\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
                },
            });
            const data = await resp.json();
            if (data.success && data.modelMockups) {
                const newSaved: Record<string, string> = {};
                Object.keys(data.modelMockups).forEach(color => {
                    Object.keys(data.modelMockups[color]).forEach(view => {
                        newSaved[\`\${color}-\${view}\`] = data.modelMockups[color][view];
                    });
                });
                setSavedMockupUrls(newSaved);
                toast.success('Mockups generated completely!');
                
                const spResp = await storeProductsApi.getById(storeProductId);
                if (spResp && spResp.success !== false) setStoreProduct(spResp.data);
            } else {
                toast.error(data.message || 'Failed to generate mockups');
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to trigger mockup generation');
        } finally {
            setIsSavingAll(false);
        }
    };

    const saveMockupPreview = async (mockupId: string) => {
        await saveAllMockupPreviews();
    };

    const allSaved = false;
    
    ` + content.substring(endEffect);
} else {
  console.log('Could not find start/end for captureWebGLPreview block');
}

// 4. Update UI: Replace the mockup rendering block with Tabs
const uiStart = content.indexOf('{allColorMockups.map(({ color, colorHex, mockups }) => {');
const uiEnd = content.indexOf(') : storeProduct.catalogProductId ? (');
if (uiStart !== -1 && uiEnd !== -1) {
  content = content.substring(0, uiStart) + 
`                                    <Tabs value={currentPreviewColor || allColorMockups[0]?.color} onValueChange={setCurrentPreviewColor} className="w-full">
                                        <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-transparent justify-start">
                                            {allColorMockups.map(({ color, colorHex }) => (
                                                <TabsTrigger 
                                                    key={color} 
                                                    value={color}
                                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border shadow-sm px-4 py-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: colorHex }} />
                                                        <span className="capitalize">{color}</span>
                                                    </div>
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        {allColorMockups.map(({ color, mockups }) => (
                                            <TabsContent key={color} value={color} className="mt-0">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {mockups.map((mockup: any, index: number) => {
                                                        const viewKey = (mockup.viewKey || 'front').toLowerCase();
                                                        const colorKey = color.toLowerCase().replace(/\\s+/g, '-');
                                                        const savedUrl = savedMockupUrls[\`\${colorKey}-\${viewKey}\`];
                                                        
                                                        const hasPlaceholder = Array.isArray(mockup.placeholders) && mockup.placeholders.length > 0;
                                                        const mockupDisplacement = mockup.displacementSettings || displacementSettings || defaultDisplacementSettings;
                                                        const mockupDesignUrls: Record<string, string> = {};
                                                        const mockupPlacements: Record<string, DesignPlacement> = {};
                                                        
                                                        if (designImagesByView[viewKey]) {
                                                            const viewPlacements = placementsByView[viewKey] || {};
                                                            const viewPlacementValues = Object.values(viewPlacements);
                                                            (mockup.placeholders || []).forEach((ph: any, idx: number) => {
                                                                if (ph.id) {
                                                                    mockupDesignUrls[ph.id] = designImagesByView[viewKey];
                                                                    if (viewPlacementValues[idx]) {
                                                                        mockupPlacements[ph.id] = {
                                                                            ...viewPlacementValues[idx],
                                                                            placeholderId: ph.id,
                                                                        };
                                                                    }
                                                                }
                                                            });
                                                        }

                                                        return (
                                                            <div key={index} className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                                                <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                                                    <span className="text-[10px] uppercase font-bold tracking-wider bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded text-slate-600">
                                                                        {viewKey}
                                                                    </span>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 px-3 w-auto rounded-md bg-white/95 border border-slate-100 shadow-sm pointer-events-auto hover:bg-slate-50 transition-colors"
                                                                        onClick={() => saveMockupPreview(mockup.id)}
                                                                        disabled={isSavingAll}
                                                                    >
                                                                        {isSavingAll ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                                                        ) : savedUrl ? (
                                                                            <Check className="h-3 w-3 text-emerald-500" />
                                                                        ) : (
                                                                            <div className="flex items-center gap-1">
                                                                                <Zap className="h-3 w-3 text-slate-400" />
                                                                                <span className="text-[10px] font-bold text-slate-500">Regenerate</span>
                                                                            </div>
                                                                        )}
                                                                    </Button>
                                                                </div>

                                                                {savedUrl && (
                                                                    <div className="absolute top-3 right-3 z-30 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                                                        <Check className="h-3 w-3" />
                                                                        Ready
                                                                    </div>
                                                                )}

                                                                <div className="aspect-[4/3] relative bg-slate-50 overflow-hidden">
                                                                    {savedUrl ? (
                                                                        <img src={savedUrl} alt={\`\${color} \${viewKey}\`} className="w-full h-full object-contain" crossOrigin="anonymous" />
                                                                    ) : mockup.imageUrl && hasPlaceholder && catalogPhysicalDimensions ? (
                                                                        <RealisticWebGLPreview
                                                                            mockupImageUrl={mockup.imageUrl}
                                                                            activePlaceholder={null}
                                                                            placeholders={(mockup.placeholders || []).map((p: any) => ({
                                                                                ...p,
                                                                                rotationDeg: p.rotationDeg ?? 0,
                                                                            }))}
                                                                            physicalWidth={catalogPhysicalDimensions.width}
                                                                            physicalHeight={catalogPhysicalDimensions.height}
                                                                            settings={mockupDisplacement}
                                                                            onSettingsChange={() => {}}
                                                                            designUrlsByPlaceholder={mockupDesignUrls}
                                                                            designPlacements={mockupPlacements}
                                                                            previewMode={true}
                                                                            currentView={viewKey}
                                                                            canvasPadding={40}
                                                                            PX_PER_INCH={Math.min(720 / catalogPhysicalDimensions.width, 520 / catalogPhysicalDimensions.height)}
                                                                            onLoad={() => {}}
                                                                            canvasElements={designData.elements || []}
                                                                            editorPlaceholders={[]}
                                                                        />
                                                                    ) : mockup.imageUrl ? (
                                                                        <img src={mockup.imageUrl} alt="Fallback" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                                                                            <ImageIcon className="h-8 w-8 opacity-20" />
                                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Missing</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                ` + content.substring(uiEnd);
} else {
  console.log('Could not find start/end for UI block');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('MockupsLibrary.tsx successfully rewritten!');
