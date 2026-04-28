import { KitProduct } from '@/types/kits';

export type KitItemSelection = {
  catalogProductId: string;
  size?: string;
  color?: string;
  quantity?: number;
};

const idOf = (value: any) => String(value?._id || value?.id || value || '');

export function getActiveKitVariants(product?: KitProduct | null) {
  return (product?.variants || []).filter((variant) =>
    variant &&
    variant.isActive !== false &&
    variant.stockStatus !== 'out_of_stock' &&
    variant.size &&
    variant.color
  );
}

export function productRequiresVariantSelection(product?: KitProduct | null) {
  return getActiveKitVariants(product).length > 0;
}

export function uniqueSorted(values: Array<string | undefined>) {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b));
}

export function getVariantSizes(product?: KitProduct | null) {
  return uniqueSorted(getActiveKitVariants(product).map((variant) => variant.size));
}

export function getVariantColors(product?: KitProduct | null, size?: string) {
  return uniqueSorted(
    getActiveKitVariants(product)
      .filter((variant) => !size || variant.size === size)
      .map((variant) => variant.color)
  );
}

export function isValidKitVariantSelection(product: KitProduct | undefined | null, selection?: KitItemSelection) {
  if (!productRequiresVariantSelection(product)) return true;
  if (!selection?.size || !selection?.color) return false;
  return getActiveKitVariants(product).some((variant) =>
    variant.size === selection.size && variant.color === selection.color
  );
}

export function buildKitSelections(products: Array<KitProduct | undefined>, selections: KitItemSelection[] = []) {
  const selectionByProduct = new Map(selections.map((selection) => [idOf(selection.catalogProductId), selection]));
  return products
    .filter(Boolean)
    .map((product) => {
      const selection = selectionByProduct.get(idOf(product));
      return {
        catalogProductId: idOf(product),
        ...(productRequiresVariantSelection(product) ? {
          size: selection?.size,
          color: selection?.color,
        } : {}),
        quantity: Math.max(1, Number(selection?.quantity || 1)),
      };
    });
}

export function sumSelectionQuantityForProduct(productId: string, selections: KitItemSelection[] = []) {
  return selections
    .filter((selection) => selection.catalogProductId === productId)
    .reduce((sum, selection) => sum + Number(selection.quantity || 0), 0);
}
