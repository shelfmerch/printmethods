const { buildVariantRequirements } = require('./kitVariantSelections');

function idOf(value) {
  return String(value?._id || value?.id || value || '');
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function normalizePackaging(packaging) {
  if (!packaging || packaging.mode === 'none') {
    return { mode: 'none', branding: 'none', notes: '' };
  }

  return {
    mode: packaging.mode,
    catalogProductId: idOf(packaging.catalogProductId),
    branding: ['none', 'logo', 'custom'].includes(packaging.branding) ? packaging.branding : 'none',
    notes: String(packaging.notes || '').trim(),
  };
}

function validatePackagingChoice({ packaging, packagingProduct }) {
  const normalized = normalizePackaging(packaging);
  if (normalized.mode === 'none') return normalized;

  if (normalized.mode !== 'catalog_product' || !normalized.catalogProductId) {
    throw Object.assign(new Error('Choose a valid packaging option'), { status: 400 });
  }

  if (
    !packagingProduct ||
    idOf(packagingProduct) !== normalized.catalogProductId ||
    packagingProduct.categoryId !== 'packaging' ||
    packagingProduct.isActive === false
  ) {
    throw Object.assign(new Error('Selected packaging must be an active packaging product'), {
      status: 400,
      code: 'INVALID_PACKAGING_PRODUCT',
    });
  }

  return normalized;
}

function calculatePackagingTotal({ packagingProduct, quantity }) {
  if (!packagingProduct || !quantity) return 0;
  return roundCurrency(Number(packagingProduct.basePrice || 0) * Number(quantity || 0));
}

function validateAddress(address = {}) {
  if (!address.fullName || !address.address1 || !address.city || !address.country) {
    throw Object.assign(new Error('Single location address is required'), { status: 400 });
  }
  return {
    fullName: String(address.fullName || '').trim(),
    email: String(address.email || '').trim(),
    phone: String(address.phone || '').trim(),
    address1: String(address.address1 || '').trim(),
    address2: String(address.address2 || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    zipCode: String(address.zipCode || '').trim(),
    country: String(address.country || '').trim(),
  };
}

function validateSingleLocationFulfillment({ products, payload }) {
  const quantity = Number(payload?.singleLocationQuantity || 0);
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw Object.assign(new Error('Single location quantity is required'), { status: 400 });
  }

  const address = validateAddress(payload?.singleLocationAddress || {});
  const locationType = ['office', 'event', 'other'].includes(payload?.singleLocationType)
    ? payload.singleLocationType
    : 'office';

  const productsById = new Map((products || []).map((product) => [idOf(product), product]));
  const requirements = buildVariantRequirements(products);
  const requirementByProduct = new Map(requirements.map((requirement) => [requirement.productId, requirement]));
  const incoming = Array.isArray(payload?.singleLocationSelections) ? payload.singleLocationSelections : [];
  const selections = [];

  for (const selection of incoming) {
    const productId = idOf(selection.catalogProductId);
    if (!productsById.has(productId)) {
      throw Object.assign(new Error('Single location includes a product that is not in this kit'), {
        status: 400,
        code: 'SINGLE_LOCATION_PRODUCT_NOT_IN_KIT',
      });
    }
    if (!requirementByProduct.has(productId)) {
      throw Object.assign(new Error('Single location size/color selections are only allowed for variant products'), {
        status: 400,
        code: 'SINGLE_LOCATION_SELECTION_NOT_REQUIRED',
      });
    }
  }

  for (const requirement of requirements) {
    const productSelections = incoming.filter((entry) => idOf(entry.catalogProductId) === requirement.productId);
    if (!productSelections.length) {
      throw Object.assign(new Error(`${requirement.productName} quantities must add up to ${quantity}`), {
        status: 400,
        code: 'SINGLE_LOCATION_VARIANT_BREAKDOWN_REQUIRED',
      });
    }

    let productTotal = 0;
    for (const selection of productSelections) {
      const selectionQty = Number(selection.quantity || 0);
      const hasVariant = requirement.variants.some((variant) =>
        variant.size === String(selection.size) && variant.color === String(selection.color)
      );
      if (!hasVariant || !Number.isFinite(selectionQty) || selectionQty < 1) {
        throw Object.assign(new Error(`${requirement.productName} has an unavailable size/color quantity`), {
          status: 400,
          code: 'SINGLE_LOCATION_VARIANT_BREAKDOWN_INVALID',
        });
      }
      productTotal += selectionQty;
      selections.push({
        catalogProductId: requirement.productId,
        size: String(selection.size),
        color: String(selection.color),
        quantity: selectionQty,
      });
    }

    if (productTotal !== quantity) {
      throw Object.assign(new Error(`${requirement.productName} quantities must add up to ${quantity}`), {
        status: 400,
        code: 'SINGLE_LOCATION_VARIANT_BREAKDOWN_MISMATCH',
      });
    }
  }

  productsById.forEach((product, productId) => {
    if (requirementByProduct.has(productId)) return;
    selections.push({ catalogProductId: productId, quantity });
  });

  return {
    quantity,
    locationType,
    address,
    notes: String(payload?.singleLocationNotes || '').trim(),
    selections,
  };
}

module.exports = {
  calculatePackagingTotal,
  normalizePackaging,
  validatePackagingChoice,
  validateSingleLocationFulfillment,
};
