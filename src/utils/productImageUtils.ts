import { Product } from "@/types";

/**
 * Categorizes and orders product mockup images into "Designed" and "Plain" groups.
 * 
 * Rules:
 * 1. Group A (Designed): All mockups containing user designs (from modelMockups, flatMockups, or previewImagesByView).
 * 2. Group B (Plain): All mockups without designs (from catalog sample mockups).
 * 3. Priority: If a color is provided, that color's mockups are moved to the front of their respective groups.
 * 4. Hero: The first image of the resulting combined array will be a designed mockup if any exist.
 */
export const getProductImageGroups = (product: any, selectedColor?: string) => {
    const designedImages: string[] = [];
    const plainImages: string[] = [];
    const seenUrls = new Set<string>();

    const sColor = selectedColor?.toLowerCase();
    const sColorHyphen = sColor?.replace(/\s+/g, '-');

    const addUrl = (url: string, group: string[]) => {
        if (url && typeof url === 'string' && !seenUrls.has(url)) {
            group.push(url);
            seenUrls.add(url);
        }
    };

    const designData = product.designData || {};
    const modelMockups = designData.modelMockups || {};
    const flatMockups = designData.flatMockups || {};
    // const previewImagesByView = designData.previewImagesByView || {};
    const previewImagesUrl = product.previewImagesUrl || [];

    // Group A: Designed Images

    // 1. Process previewImagesUrl (metadata-rich objects from backend)
    if (Array.isArray(previewImagesUrl) && previewImagesUrl.length > 0) {
        previewImagesUrl.forEach((img: any) => {
            if (!img.url) return;
            const imgColor = (img.color || img.colorKey || '').toLowerCase();
            
            // If color is selected, only add if mathces
            if (sColor) {
                if (imgColor === sColor || imgColor === sColorHyphen) {
                    addUrl(img.url, designedImages);
                }
            } else {
                // No color selected, add all designed ones
                addUrl(img.url, designedImages);
            }
        });
    }

    // 2. If we still need more or if previewImagesUrl wasn't enough, use modelMockups
    if (sColor) {
        const colorModels = modelMockups[sColorHyphen] || modelMockups[selectedColor] || {};
        const views = ['front', 'back', 'left', 'right'];
        views.forEach(view => {
            if (colorModels[view]) addUrl(colorModels[view], designedImages);
        });
        Object.keys(colorModels).forEach(view => {
            if (!views.includes(view)) {
                if (colorModels[view]) addUrl(colorModels[view], designedImages);
            }
        });
    } else if (!Array.isArray(previewImagesUrl) || previewImagesUrl.length === 0) {
        // Only fallback to all modelMockups if no color selected AND no previewImagesUrl
        Object.keys(modelMockups).forEach(cKey => {
            const colorDict = modelMockups[cKey];
            if (colorDict && typeof colorDict === 'object') {
                ['front', 'back', 'left', 'right'].forEach(view => {
                    if (colorDict[view]) addUrl(colorDict[view], designedImages);
                });
                Object.values(colorDict).forEach(url => addUrl(url as string, designedImages));
            }
        });
    }

    // 3. Generic designed mockups (flat ones)
    // Only add if no color selected, OR if they are truly generic
    if (!sColor) {
        ['front', 'back', 'left', 'right'].forEach(view => {
            if (flatMockups[view]) addUrl(flatMockups[view], designedImages);
        });
        Object.values(flatMockups).forEach(url => addUrl(url as string, designedImages));
        // Object.values(previewImagesByView).forEach(url => addUrl(url as string, designedImages));
    }

    // Group B: Plain Mockups (No Design)
    const catalogProduct = product.catalogProduct || {};
    const sampleMockups = catalogProduct.design?.sampleMockups ||
        catalogProduct.sampleMockups ||
        product.sampleMockups ||
        [];

    if (sColor) {
        // ONLY show plain sample mockups for that color
        sampleMockups.forEach((m: any) => {
            const mColor = (m.colorKey || m.color || '').toLowerCase();
            if (m.imageUrl && (mColor === sColor || mColor === sColorHyphen)) {
                addUrl(m.imageUrl, plainImages);
            }
        });
    } else {
        // Add all sample mockups by view order
        ['front', 'back', 'left', 'right'].forEach(view => {
            sampleMockups.forEach((m: any) => {
                if (m.imageUrl && (m.viewKey === view || m.view === view)) {
                    addUrl(m.imageUrl, plainImages);
                }
            });
        });
        sampleMockups.forEach((m: any) => {
            if (m.imageUrl) addUrl(m.imageUrl, plainImages);
        });
    }

    // Fallbacks: Only if we have absolutely nothing
    if (designedImages.length === 0 && plainImages.length === 0) {
        if (product.mockupUrl) addUrl(product.mockupUrl, plainImages);
        if (Array.isArray(product.mockupUrls)) {
            product.mockupUrls.forEach((url: string) => addUrl(url, plainImages));
        }
    }

    return {
        designedImages,
        plainImages,
        allImages: [...designedImages, ...plainImages]
    };
};
