import type { Product, Store } from '@/shared/types';
import { getProductImageGroups } from '@/shared/utils/productImageUtils';

export function mapStoreProductsToProducts(store: Store, storeProducts: any[]): Product[] {
  return (storeProducts || []).map((sp: any) => {
    const id = sp._id?.toString?.() || sp.id;
    const basePrice: number =
      typeof sp.sellingPrice === 'number'
        ? sp.sellingPrice
        : typeof sp.price === 'number'
          ? sp.price
          : 0;

    const catalogProduct =
      sp.catalogProductId && typeof sp.catalogProductId === 'object' ? sp.catalogProductId : null;
    const catalogProductId =
      catalogProduct?._id?.toString?.() ||
      (typeof sp.catalogProductId === 'string' ? sp.catalogProductId : '');

    const spWithCatalog = { ...sp, catalogProduct };
    const { allImages } = getProductImageGroups(spWithCatalog);
    const primaryImage = allImages[0] || undefined;

    return {
      id,
      userId: store.userId,
      name: sp.title || sp.name || catalogProduct?.name || 'Untitled product',
      description: sp.description || catalogProduct?.description,
      baseProduct: catalogProductId,
      price: basePrice,
      compareAtPrice: typeof sp.compareAtPrice === 'number' ? sp.compareAtPrice : undefined,
      mockupUrl: primaryImage,
      mockupUrls: allImages,
      designs: sp.designData?.designs || {},
      designBoundaries: sp.designData?.designBoundaries,
      variants: { colors: [], sizes: [] },
      categoryId: catalogProduct?.categoryId?.toString?.() || catalogProduct?.categoryId,
      subcategoryId:
        catalogProduct?.subcategoryIds?.[0]?.toString?.() ||
        (Array.isArray(catalogProduct?.subcategoryIds) && catalogProduct.subcategoryIds[0]) ||
        catalogProduct?.subcategoryIds?.[0],
      subcategoryIds: Array.isArray(catalogProduct?.subcategoryIds)
        ? catalogProduct.subcategoryIds.map((x: any) => x?.toString?.() || x)
        : [],
      catalogProduct,
      createdAt: sp.createdAt || new Date().toISOString(),
      updatedAt: sp.updatedAt || new Date().toISOString(),
    };
  });
}

