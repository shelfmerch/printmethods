import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { storeProductsApi } from '@/lib/api';
import { fetchWithApiAuth } from '@/lib/api';
import {
  capturePreviewFromStage,
  captureDesignOnlyForView,
  captureStageToBlob,
  uploadImageBlob,
} from '../services/preview.service';
import {
  saveUserPreview,
  saveFlatMockup,
  persistDesignData,
  triggerServerMockupGeneration,
  type DesignDataPayload,
} from '../services/product.service';
import type { CanvasElement, Product, ProductView } from '@/types/editor';
import type { DisplacementSettings, DesignPlacement } from '@/types/product';
import type { PrintMethodId } from '@/config/printMethods';

interface UsePreviewOptions {
  // Refs & stage
  stageRef: React.RefObject<any>;
  isSavingMockupsRef: React.MutableRefObject<boolean>;

  // Canvas / product state
  elements: CanvasElement[];
  product: Product | null;
  stageSize: { width: number; height: number };
  imageSizesByView: Record<string, { width: number; height: number; x: number; y: number }>;

  // View state
  currentView: string;
  setCurrentView: (view: 'front' | 'back' | 'sleeves') => void;
  previewMode: boolean;

  // Dirty flags
  dirtyViewsForDesign: Set<string>;
  setDirtyViewsForDesign: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Store / publish
  storeProductId: string | null;
  setStoreProductId: (id: string) => void;

  // Preview images
  savedPreviewImages: Record<string, string>;
  setSavedPreviewImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savedMockupPreviews: Record<string, string>;
  setSavedMockupPreviews: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setPreviewCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getPreviewCacheKey: (viewKey: string, elements: CanvasElement[]) => string;

  // Design data (for persistence)
  designUrlsByPlaceholder: Record<string, Record<string, string>>;
  placementsByView: Record<string, Record<string, DesignPlacement>>;
  displacementSettings: DisplacementSettings;
  selectedSizesByColor: Record<string, string[]>;
  primaryColorHex: string | null;
  printMethod: PrintMethodId;

  // UI callbacks
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setEditingTextId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsCapturingMockup: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;

  // Routing
  id: string | undefined;
}

/**
 * Manages preview capture, auto-save effects, and the save action.
 * Extracted from DesignEditor.tsx lines 2178–3405.
 */
export const usePreview = ({
  stageRef,
  isSavingMockupsRef,
  elements,
  product,
  stageSize,
  imageSizesByView,
  currentView,
  setCurrentView,
  previewMode,
  dirtyViewsForDesign,
  setDirtyViewsForDesign,
  storeProductId,
  setStoreProductId,
  savedPreviewImages,
  setSavedPreviewImages,
  savedMockupPreviews,
  setSavedMockupPreviews,
  setPreviewCache,
  getPreviewCacheKey,
  designUrlsByPlaceholder,
  placementsByView,
  displacementSettings,
  selectedSizesByColor,
  primaryColorHex,
  printMethod,
  setSelectedIds,
  setEditingTextId,
  setIsCapturingMockup,
  setHasUnsavedChanges,
  id,
}: UsePreviewOptions) => {

  // ── capturePreviewImage ────────────────────────────────────────────────────
  const capturePreviewImage = useCallback(
    async (viewKey?: string): Promise<string | null> => {
      if (!stageRef.current) {
        console.warn('Stage ref not available for capturePreviewImage');
        return null;
      }
      return capturePreviewFromStage(stageRef.current, viewKey);
    },
    [stageRef],
  );

  // ── captureDesignOnlyImage ─────────────────────────────────────────────────
  const captureDesignOnlyImage = useCallback(
    async (viewKey: string): Promise<string | null> => {
      if (!stageRef.current) return null;
      return captureDesignOnlyForView(
        viewKey,
        stageRef.current.width(),
        stageRef.current.height(),
        elements,
        product,
      );
    },
    [stageRef, elements, product],
  );

  // ── captureDesignOnlyImagesAllViews ────────────────────────────────────────
  const captureDesignOnlyImagesAllViews = useCallback(async (): Promise<{
    images: Record<string, string>;
    garmentBounds: Record<string, { x: number; y: number; width: number; height: number }>;
  }> => {
    const images: Record<string, string> = {};
    const garmentBounds: Record<string, { x: number; y: number; width: number; height: number }> = {};
    if (!stageRef.current || !product?.design?.views?.length)
      return { images, garmentBounds };

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
  }, [
    stageRef,
    product?.design?.views,
    captureDesignOnlyImage,
    imageSizesByView,
    setEditingTextId,
    setSelectedIds,
    setIsCapturingMockup,
  ]);

  // ── captureAllViewPreviews (legacy stage-based approach) ──────────────────
  const captureAllViewPreviews = useCallback(
    async (): Promise<Record<string, string>> => {
      const previewsByView: Record<string, string> = {};
      const views = product?.design?.views || [];
      if (views.length === 0) { console.warn('No views to capture'); return previewsByView; }

      const originalView = currentView;
      for (const view of views) {
        const viewKey = view.key;
        toast.info(`Capturing preview for ${viewKey} view...`);
        setCurrentView(viewKey as any);
        await new Promise(resolve => setTimeout(resolve, 800));
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const previewUrl = await capturePreviewImage(viewKey);
        if (previewUrl) previewsByView[viewKey] = previewUrl;
        else console.warn(`Failed to capture preview for ${viewKey} view`);
      }
      setCurrentView(originalView as any);
      return previewsByView;
    },
    [product?.design?.views, currentView, setCurrentView, capturePreviewImage],
  );

  // ── handleExport ───────────────────────────────────────────────────────────
  const handleExport = useCallback(
    (format: 'png' | 'jpg' | 'svg') => {
      if (!stageRef.current) return;
      const dataURL = stageRef.current.toDataURL({
        mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
        quality: 1,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `design.${format}`;
      link.href = dataURL;
      link.click();
      toast.success(`Design exported as ${format.toUpperCase()}`);
    },
    [stageRef],
  );

  // ── handleExportPreview ────────────────────────────────────────────────────
  const handleExportPreview = useCallback(
    async (format: 'png' | 'jpg' = 'png') => {
      try {
        if (!stageRef.current) { toast.error('Preview is not available to export'); return; }
        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const dataUrl = stageRef.current.toDataURL({ mimeType: mime, quality: 1, pixelRatio: 2 });
        const blob = await fetch(dataUrl).then(r => r.blob());
        if (!blob) { toast.error('Failed to generate image'); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `preview.${format}`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        toast.success(`Preview exported as ${format.toUpperCase()}`);
      } catch (err) {
        console.error('Error exporting preview image:', err);
        toast.error('Error exporting preview image');
      }
    },
    [stageRef],
  );

  // ── handleSave ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!stageRef.current || !id) { toast.error('Canvas is not ready to save'); return; }

    try {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const currentViewBlob = await captureStageToBlob(stageRef.current);
      if (!currentViewBlob) { toast.error('Failed to generate preview image'); return; }

      const uploadedUrl = await uploadImageBlob(currentViewBlob, `preview-${currentView}.png`);
      if (!uploadedUrl) { toast.error('Failed to upload preview image'); return; }

      const nextPreviewImages = { ...savedPreviewImages, [currentView]: uploadedUrl };
      setSavedPreviewImages(nextPreviewImages);

      const ok = await saveUserPreview(id, currentView, uploadedUrl);
      if (ok) {
        toast.success('Preview saved');
        setHasUnsavedChanges(false);
        const cacheKey = getPreviewCacheKey(currentView, elements);
        setPreviewCache(prev => ({ ...prev, [cacheKey]: uploadedUrl }));
        setSavedPreviewImages(nextPreviewImages as Record<string, string>);
      } else {
        toast.error('Uploaded image, but failed to save to user previews');
      }

      const nextMockupPreviews = { ...savedMockupPreviews, [currentView]: uploadedUrl };
      setSavedMockupPreviews(nextMockupPreviews as Record<string, string>);

      if (storeProductId) {
        try {
          await persistDesignData(storeProductId, {
            elements,
            designUrlsByPlaceholder,
            placementsByView,
            views: product?.design?.views || [],
            previews: nextMockupPreviews,
            displacementSettings,
            selectedSizesByColor,
            primaryColorHex,
            printMethod,
          });
          console.log(`[handleSave] Saved preview to designData.previews for "${currentView}":`, uploadedUrl);
        } catch (e) {
          console.warn('[handleSave] Failed to persist designData.previews:', e);
        }
      }

      if (!storeProductId || !product?.design?.views?.length) return;
      if (isSavingMockupsRef.current) return;
      isSavingMockupsRef.current = true;

      const views = product.design.views;
      const originalView = currentView;
      setSelectedIds([]);
      setIsCapturingMockup(true);

      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const mockupUrlsByView: Record<string, string> = {};

      for (const view of views) {
        const viewKey = view.key;
        setCurrentView(viewKey as any);

        await new Promise(resolve => setTimeout(resolve, 600));
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        try {
          const blob = await captureStageToBlob(stageRef.current);
          if (!blob) { console.error(`[handleSave] captureStageBlob null for "${viewKey}"`); continue; }
          const url = await uploadImageBlob(blob, `mockup-${viewKey}.png`);
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

      setCurrentView(originalView as any);
      setIsCapturingMockup(false);

      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      if (Object.keys(mockupUrlsByView).length > 0) {
        const allPreviews = { ...savedMockupPreviews, ...mockupUrlsByView };
        setSavedMockupPreviews(allPreviews as Record<string, string>);
        try {
          await persistDesignData(storeProductId, {
            elements,
            designUrlsByPlaceholder,
            placementsByView,
            views,
            previews: allPreviews,
            displacementSettings,
            selectedSizesByColor,
            primaryColorHex,
            printMethod,
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
  }, [
    stageRef, id, currentView, savedPreviewImages, savedMockupPreviews,
    storeProductId, elements, designUrlsByPlaceholder, placementsByView,
    displacementSettings, selectedSizesByColor, primaryColorHex, printMethod,
    product?.design?.views, isSavingMockupsRef,
    setSavedPreviewImages, setSavedMockupPreviews, setPreviewCache,
    getPreviewCacheKey, setSelectedIds, setIsCapturingMockup,
    setHasUnsavedChanges, setCurrentView,
  ]);

  // ── Auto-save preview when entering Preview mode (design dirty) ───────────
  useEffect(() => {
    if (!previewMode) return;

    const cacheKey = getPreviewCacheKey(currentView, elements);
    const isDirtyForDesign = dirtyViewsForDesign.has(currentView);
    if (!isDirtyForDesign) return;

    setDirtyViewsForDesign(prev => { const next = new Set(prev); next.delete(currentView); return next; });

    const run = async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      const previewUrl = await capturePreviewImage(currentView);
      if (!previewUrl) return;

      setPreviewCache(prev => ({ ...prev, [cacheKey]: previewUrl }));
      setSavedPreviewImages(prev => ({ ...prev, [currentView]: previewUrl }));

      if (storeProductId) {
        try {
          await saveFlatMockup(storeProductId, currentView, previewUrl);
        } catch (err) {
          console.error('Failed to save flat mockup to backend:', err);
        }
      }
    };
    run();
  }, [
    previewMode, currentView, dirtyViewsForDesign, capturePreviewImage,
    storeProductId, elements, designUrlsByPlaceholder,
    getPreviewCacheKey, setDirtyViewsForDesign, setPreviewCache, setSavedPreviewImages,
  ]);

  // ── Auto-save flat mockup when design images are added (in Edit mode) ─────
  useEffect(() => {
    if (previewMode) return;
    if (dirtyViewsForDesign.size === 0) return;
    const hasImageElements = elements.some(
      el => el.type === 'image' && (el.view === currentView || !el.view),
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
          await saveFlatMockup(storeProductId, currentView, previewUrl);
        } catch (err) {
          console.error('Error saving flat mockup after upload:', err);
        }
      }

      setDirtyViewsForDesign(prev => { const next = new Set(prev); next.delete(currentView); return next; });
    };
    run();
  }, [
    elements, currentView, storeProductId, dirtyViewsForDesign, previewMode,
    capturePreviewImage, setSavedPreviewImages, setDirtyViewsForDesign,
  ]);

  // ── Auto-save composed mockups for all dirty views ─────────────────────────
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
        if (!views.find((v: ProductView) => v.key === viewKey)) continue;
        setCurrentView(viewKey as any);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        try {
          stageRef.current!.getLayers().forEach((l: any) => l.draw());
          const blob: Blob | null = await new Promise(resolve => {
            stageRef.current!.toBlob(
              (b: Blob | null) => resolve(b),
              { mimeType: 'image/png', pixelRatio: 2 },
            );
          });
          if (!blob) continue;
          const url = await uploadImageBlob(blob, `mockup-${viewKey}.png`);
          if (url) mockupUrlsByView[viewKey] = url;
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
        setSavedMockupPreviews(allPreviews as Record<string, string>);

        try {
          await persistDesignData(storeProductId, {
            elements,
            designUrlsByPlaceholder,
            placementsByView,
            views,
            previews: allPreviews,
            displacementSettings,
            selectedSizesByColor,
            primaryColorHex,
            printMethod,
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
    dirtyViewsForDesign, storeProductId, product?.design?.views, currentView,
    elements, designUrlsByPlaceholder, placementsByView, savedMockupPreviews,
    displacementSettings, selectedSizesByColor, primaryColorHex, printMethod,
    stageRef, isSavingMockupsRef, setCurrentView, setSelectedIds,
    setIsCapturingMockup, setSavedMockupPreviews, setDirtyViewsForDesign,
  ]);

  return {
    capturePreviewImage,
    captureDesignOnlyImage,
    captureDesignOnlyImagesAllViews,
    captureAllViewPreviews,
    handleExport,
    handleExportPreview,
    handleSave,
  };
};
