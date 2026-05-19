/**
 * catalogproducts.pricing.specificPrices[] ↔ catalogproductprices (ObjectId refs).
 */

const mongoose = require('mongoose');
const CatalogProductPrice = require('../models/CatalogProductPrice');

const PRICE_SELECT =
  'ruleId combination currency country group store customer applyToAllCustomers minQuantity startDate endDate isUnlimited useDiscount discountValue discountType discountTaxMode useSpecificPrice specificPriceTaxExcl specificPriceTaxIncl discountTaxIncl metadata';
const PRICE_SORT = { minQuantity: 1, 'metadata.order': 1, createdAt: 1 };

function resolveObjectId(ref) {
  if (!ref) return null;
  if (mongoose.Types.ObjectId.isValid(String(ref))) {
    return new mongoose.Types.ObjectId(String(ref));
  }
  if (typeof ref === 'object' && ref._id) {
    return new mongoose.Types.ObjectId(String(ref._id));
  }
  return null;
}

function resolveProductId(ref) {
  if (!ref) return null;
  if (mongoose.Types.ObjectId.isValid(String(ref))) {
    return new mongoose.Types.ObjectId(String(ref));
  }
  if (typeof ref === 'object' && ref._id) {
    return new mongoose.Types.ObjectId(String(ref._id));
  }
  return null;
}

/** Legacy embedded rule object (admin API), not an ObjectId ref. */
function isEmbeddedSpecificPriceEntry(entry) {
  if (entry == null) return false;
  if (entry instanceof mongoose.Types.ObjectId) return false;
  if (typeof entry === 'string') return false;
  if (typeof entry !== 'object') return false;
  if (entry._id && entry.ruleId && typeof entry.minQuantity === 'number') return false;
  return (
    entry.id != null
    || entry.ruleId != null
    || typeof entry.minQuantity === 'number'
    || typeof entry.discountValue === 'number'
  );
}

function priceDocToLegacyShape(p) {
  if (!p) return null;
  return {
    id: p.ruleId || String(p._id),
    combination: p.combination,
    currency: p.currency,
    country: p.country,
    group: p.group,
    store: p.store,
    customer: p.customer,
    applyToAllCustomers: p.applyToAllCustomers,
    minQuantity: p.minQuantity,
    startDate: p.startDate,
    endDate: p.endDate,
    isUnlimited: p.isUnlimited,
    useDiscount: p.useDiscount,
    discountValue: p.discountValue,
    discountType: p.discountType,
    discountTaxMode: p.discountTaxMode,
    useSpecificPrice: p.useSpecificPrice,
    specificPriceTaxExcl: p.specificPriceTaxExcl,
    specificPriceTaxIncl: p.specificPriceTaxIncl,
    discountTaxIncl: p.discountTaxIncl,
  };
}

function specificPriceToPriceDocFields(sp, index = 0) {
  if (!sp || typeof sp !== 'object') return null;
  const ruleId =
    sp.id != null && String(sp.id) !== ''
      ? String(sp.id)
      : sp.ruleId != null && String(sp.ruleId) !== ''
        ? String(sp.ruleId)
        : `_legacy_${index}_${sp.minQuantity ?? 0}_${sp.discountValue ?? 0}`;
  return {
    ruleId,
    combination: sp.combination ?? 'All combinations',
    currency: sp.currency ?? 'All currencies',
    country: sp.country ?? 'All countries',
    group: sp.group ?? 'All groups',
    store: sp.store ?? 'All stores',
    customer: sp.customer ?? '',
    applyToAllCustomers: sp.applyToAllCustomers ?? true,
    minQuantity: sp.minQuantity ?? 1,
    startDate: sp.startDate ?? '',
    endDate: sp.endDate ?? '',
    isUnlimited: sp.isUnlimited ?? false,
    useDiscount: sp.useDiscount ?? false,
    discountValue: sp.discountValue ?? 0,
    discountType: sp.discountType ?? 'percentage',
    discountTaxMode: sp.discountTaxMode ?? 'tax_excluded',
    useSpecificPrice: sp.useSpecificPrice ?? false,
    specificPriceTaxExcl: sp.specificPriceTaxExcl ?? 0,
    specificPriceTaxIncl: sp.specificPriceTaxIncl,
    discountTaxIncl: sp.discountTaxIncl,
    metadata: { order: sp.minQuantity ?? 0 },
  };
}

function filterApiSpecificPricePayloads(specificPrices) {
  if (!Array.isArray(specificPrices)) return [];
  return specificPrices.filter(isEmbeddedSpecificPriceEntry);
}

function getSpecificPriceRefIds(product) {
  const sp = product?.pricing?.specificPrices;
  if (!Array.isArray(sp)) return [];
  return sp.filter((e) => !isEmbeddedSpecificPriceEntry(e)).map(resolveObjectId).filter(Boolean);
}

function getLegacyEmbeddedSpecificPrices(product) {
  const sp = product?.pricing?.specificPrices;
  if (!Array.isArray(sp)) return [];
  return sp.filter(isEmbeddedSpecificPriceEntry);
}

function pricingInputWithoutSpecificPrices(pricing) {
  if (!pricing || typeof pricing !== 'object') return pricing;
  const { specificPrices, ...rest } = pricing;
  return rest;
}

function stripEmbeddedSpecificPricesFromProduct(product) {
  if (!product?.pricing) return;
  const sp = product.pricing.specificPrices;
  if (!Array.isArray(sp) || !sp.some(isEmbeddedSpecificPriceEntry)) return;
  const pricing = { ...(product.pricing.toObject?.() || product.pricing) };
  pricing.specificPrices = sp.filter((e) => !isEmbeddedSpecificPriceEntry(e));
  product.pricing = pricing;
  product.markModified?.('pricing');
}

async function loadPricesByRef(product) {
  const pid = resolveProductId(product._id);
  let ids = getSpecificPriceRefIds(product);

  if (ids.length) {
    const byRef = await CatalogProductPrice.find({ _id: { $in: ids } })
      .select(PRICE_SELECT)
      .sort(PRICE_SORT)
      .lean();
    if (byRef.length > 0) return byRef;
  }

  if (pid) {
    const byProduct = await CatalogProductPrice.find({ productId: pid })
      .select(PRICE_SELECT)
      .sort(PRICE_SORT)
      .lean();
    if (byProduct.length > 0) return byProduct;
  }

  const embedded = getLegacyEmbeddedSpecificPrices(product);
  if (pid && embedded.length > 0) {
    await upsertPricesForProduct(pid, embedded, { syncRefs: true });
    return CatalogProductPrice.find({ productId: pid }).select(PRICE_SELECT).sort(PRICE_SORT).lean();
  }

  return [];
}

function attachPricesToPricingForApi(product, priceDocs) {
  product.pricing = product.pricing || {};
  product.pricing.specificPrices = (priceDocs || []).map(priceDocToLegacyShape).filter(Boolean);
}

async function upsertPricesForProduct(productId, specificPrices, options = {}) {
  const { syncRefs = true } = options;
  const pid = resolveProductId(productId);
  if (!pid || !Array.isArray(specificPrices)) return;

  const payloads = filterApiSpecificPricePayloads(specificPrices);
  const ruleIds = [];
  const ops = [];

  for (let i = 0; i < payloads.length; i += 1) {
    const fields = specificPriceToPriceDocFields(payloads[i], i);
    if (!fields) continue;
    ruleIds.push(fields.ruleId);
    ops.push({
      updateOne: {
        filter: { productId: pid, ruleId: fields.ruleId },
        update: { $set: { productId: pid, ...fields } },
        upsert: true,
      },
    });
  }

  if (ops.length) {
    await CatalogProductPrice.bulkWrite(ops, { ordered: false });
  }

  if (ruleIds.length) {
    await CatalogProductPrice.deleteMany({ productId: pid, ruleId: { $nin: ruleIds } });
  } else {
    await CatalogProductPrice.deleteMany({ productId: pid });
  }

  if (syncRefs) {
    await syncPricingSpecificPriceRefs(pid);
  }
}

/** Write ObjectId refs to catalogproducts.pricing.specificPrices from catalogproductprices. */
async function syncPricingSpecificPriceRefs(productId) {
  const CatalogProduct = require('../models/CatalogProduct');
  const id = resolveProductId(productId);
  if (!id) return null;

  const [existing, priceRows] = await Promise.all([
    CatalogProduct.findById(id).select('pricing').lean(),
    CatalogProductPrice.find({ productId: id }).select('_id').sort(PRICE_SORT).lean(),
  ]);

  const pricing = {
    retailPriceTaxExcl: existing?.pricing?.retailPriceTaxExcl ?? 0,
    taxRule: existing?.pricing?.taxRule ?? '',
    taxRate: existing?.pricing?.taxRate ?? 0,
    retailPriceTaxIncl: existing?.pricing?.retailPriceTaxIncl ?? 0,
    costPriceTaxExcl: existing?.pricing?.costPriceTaxExcl ?? 0,
    specificPrices: priceRows.map((p) => p._id),
  };

  return CatalogProduct.findByIdAndUpdate(
    id,
    { $set: { pricing } },
    { new: true },
  ).lean();
}

async function persistCatalogSpecificPrices(productId, pricing) {
  if (!pricing || !Object.prototype.hasOwnProperty.call(pricing, 'specificPrices')) {
    return;
  }
  const payloads = filterApiSpecificPricePayloads(pricing.specificPrices || []);
  await upsertPricesForProduct(productId, payloads, { syncRefs: true });
}

module.exports = {
  isEmbeddedSpecificPriceEntry,
  priceDocToLegacyShape,
  filterApiSpecificPricePayloads,
  pricingInputWithoutSpecificPrices,
  stripEmbeddedSpecificPricesFromProduct,
  loadPricesByRef,
  attachPricesToPricingForApi,
  upsertPricesForProduct,
  syncPricingSpecificPriceRefs,
  persistCatalogSpecificPrices,
  getSpecificPriceRefIds,
};
