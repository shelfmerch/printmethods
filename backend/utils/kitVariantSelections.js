function idOf(value) {
  return String(value?._id || value?.id || value || '');
}

function activeVariantsFor(product) {
  return (product?.variants || []).filter((variant) =>
    variant &&
    variant.isActive !== false &&
    !variant.discontinuedAt &&
    variant.stockStatus !== 'out_of_stock' &&
    variant.size &&
    variant.color
  );
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b));
}

function buildVariantRequirements(products) {
  return (products || [])
    .map((product) => {
      const variants = activeVariantsFor(product);
      if (!variants.length) return null;
      return {
        productId: idOf(product),
        productName: product.name || 'Selected product',
        sizes: uniqueSorted(variants.map((variant) => variant.size)),
        colors: uniqueSorted(variants.map((variant) => variant.color)),
        variants: variants.map((variant) => ({
          size: String(variant.size),
          color: String(variant.color),
        })),
      };
    })
    .filter(Boolean);
}

function attachVariantsToProducts(products, variants) {
  const variantsByProduct = new Map();
  (variants || []).forEach((variant) => {
    const productId = idOf(variant.catalogProductId);
    if (!variantsByProduct.has(productId)) variantsByProduct.set(productId, []);
    variantsByProduct.get(productId).push(variant);
  });

  return (products || []).map((product) => ({
    ...product,
    variants: variantsByProduct.get(idOf(product)) || [],
    availableSizes: uniqueSorted((variantsByProduct.get(idOf(product)) || []).map((variant) => variant.size)),
    availableColors: uniqueSorted((variantsByProduct.get(idOf(product)) || []).map((variant) => variant.color)),
  }));
}

function validateSelectionsForKit({ products, selections, context = 'Recipient' }) {
  const productsById = new Map((products || []).map((product) => [idOf(product), product]));
  const requirements = buildVariantRequirements(products);
  const requirementByProduct = new Map(requirements.map((requirement) => [requirement.productId, requirement]));
  const selectionByProduct = new Map();

  for (const selection of selections || []) {
    const productId = idOf(selection.catalogProductId);
    if (!productId) continue;
    if (!productsById.has(productId)) {
      throw Object.assign(new Error(`${context} selected a product that is not in this kit`), { status: 400 });
    }
    if (selectionByProduct.has(productId)) {
      throw Object.assign(new Error(`${context} has duplicate selections for a kit product`), { status: 400 });
    }
    selectionByProduct.set(productId, selection);
  }

  requirements.forEach((requirement) => {
    const selection = selectionByProduct.get(requirement.productId);
    if (!selection?.size || !selection?.color) {
      throw Object.assign(new Error(`${context} must choose size and color for ${requirement.productName}`), {
        status: 400,
        code: 'KIT_VARIANT_SELECTION_REQUIRED',
        details: { productId: requirement.productId, productName: requirement.productName },
      });
    }

    const hasVariant = requirement.variants.some((variant) =>
      variant.size === String(selection.size) && variant.color === String(selection.color)
    );
    if (!hasVariant) {
      throw Object.assign(new Error(`${context} selected an unavailable size/color for ${requirement.productName}`), {
        status: 400,
        code: 'KIT_VARIANT_SELECTION_INVALID',
        details: {
          productId: requirement.productId,
          productName: requirement.productName,
          size: selection.size,
          color: selection.color,
        },
      });
    }
  });

  const validated = [];
  productsById.forEach((product, productId) => {
    const selection = selectionByProduct.get(productId);
    const requirement = requirementByProduct.get(productId);
    validated.push({
      catalogProductId: productId,
      ...(requirement ? { size: String(selection.size), color: String(selection.color) } : {}),
      quantity: Math.max(1, Number(selection?.quantity || 1)),
    });
  });

  return validated;
}

module.exports = {
  activeVariantsFor,
  attachVariantsToProducts,
  buildVariantRequirements,
  validateSelectionsForKit,
};
