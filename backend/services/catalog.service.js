const CatalogProduct = require('../models/CatalogProduct');
const CatalogProductVariant = require('../models/CatalogProductVariant');
const CatalogProductMockup = require('../models/CatalogProductMockup');
const CatalogProductInventory = require('../models/CatalogProductInventory');
const CatalogProductAttribute = require('../models/CatalogProductAttribute');
const { NotFoundError } = require('../public-api/core/errors');
const {
  toCatalogSummaryDTO,
  toCatalogDetailDTO,
  toCatalogVariantDTO,
} = require('../dtos/catalog.dto');

async function hydrateMockupsAndInventoryForProducts(products, { includeMockups = true, includeInventory = true } = {}) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const ids = products.map((p) => p._id).filter(Boolean);

  const [mockups, inventories] = await Promise.all([
    includeMockups
      ? CatalogProductMockup.find({ productId: { $in: ids } })
        .select('productId viewKey colorKey imageUrl placeholders displacementSettings metadata')
        .lean()
      : Promise.resolve([]),
    includeInventory
      ? CatalogProductInventory.find({ productId: { $in: ids } })
        .select('productId currentStock reservedStock incomingStock minimumQuantity lowStockAlertEnabled lowStockAlertEmail lowStockThreshold stockLocation outOfStockBehavior')
        .lean()
      : Promise.resolve([]),
  ]);

  const mockupsByProduct = new Map();
  for (const m of mockups) {
    const key = String(m.productId);
    const arr = mockupsByProduct.get(key) || [];
    arr.push({
      id: m._id?.toString?.() || undefined,
      viewKey: m.viewKey,
      colorKey: m.colorKey,
      imageUrl: m.imageUrl,
      placeholders: m.placeholders,
      displacementSettings: m.displacementSettings,
      metadata: m.metadata,
    });
    mockupsByProduct.set(key, arr);
  }

  const inventoryByProduct = new Map();
  for (const inv of inventories) {
    inventoryByProduct.set(String(inv.productId), inv);
  }

  for (const p of products) {
    const pid = String(p._id);
    // Backward-compatible shape: keep design.sampleMockups + stocks on the response doc
    p.design = p.design || {};
    if (!Array.isArray(p.design.sampleMockups) || p.design.sampleMockups.length === 0) {
      p.design.sampleMockups = mockupsByProduct.get(pid) || [];
    }

    if (!p.stocks || typeof p.stocks !== 'object') {
      p.stocks = {};
    }
    const inv = inventoryByProduct.get(pid);
    if (inv) {
      // Only set fields we extracted; keep any embedded values if already present
      if (p.stocks.currentStock === undefined) p.stocks.currentStock = inv.currentStock;
      if (p.stocks.minimumQuantity === undefined) p.stocks.minimumQuantity = inv.minimumQuantity;
      if (p.stocks.stockLocation === undefined) p.stocks.stockLocation = inv.stockLocation;
      if (p.stocks.lowStockAlertEnabled === undefined) p.stocks.lowStockAlertEnabled = inv.lowStockAlertEnabled;
      if (p.stocks.lowStockAlertEmail === undefined) p.stocks.lowStockAlertEmail = inv.lowStockAlertEmail;
      if (p.stocks.lowStockThreshold === undefined) p.stocks.lowStockThreshold = inv.lowStockThreshold;
      if (p.stocks.outOfStockBehavior === undefined) p.stocks.outOfStockBehavior = inv.outOfStockBehavior;
    }
  }

  return products;
}

async function hydrateAttributesForProducts(products, { includeAttributes = false } = {}) {
  if (!includeAttributes) return products;
  if (!Array.isArray(products) || products.length === 0) return products;

  const ids = products.map((p) => p._id).filter(Boolean);
  const docs = await CatalogProductAttribute.find({ productId: { $in: ids } }).lean();
  const byProduct = new Map();
  for (const d of docs) byProduct.set(String(d.productId), d);

  for (const p of products) {
    const pid = String(p._id);
    // Only fill if missing; keep embedded attributes if already present.
    if (p.attributes && typeof p.attributes === 'object' && Object.keys(p.attributes).length > 0) continue;
    const d = byProduct.get(pid);
    if (!d) continue;
    const { material, gsm, hoodType, pocketStyle, fit, gender, brand } = d;
    p.attributes = { material, gsm, hoodType, pocketStyle, fit, gender, brand };
  }

  return products;
}

/**
 * Returns lightweight catalog summaries for API listing.
 * NEVER returns design internals or displacementSettings.
 */
async function listCatalogProducts({
  categoryId,
  subcategory,
  search,
  page = 1,
  limit = 20,
  includeAttributes = false,
} = {}) {
  const filter = { isActive: true, isPublished: true };
  if (categoryId) filter.categoryId = categoryId;
  if (subcategory) filter.subcategoryIds = subcategory;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    CatalogProduct.find(filter)
      // Keep listing lightweight: avoid embedded design.sampleMockups and stocks payloads.
      // We hydrate minimal mockup+inventory fields from dedicated collections for backward compatibility.
      .select('name shortDescription highlights categoryId subcategoryIds basePrice currency galleryImages tags isActive description shipping gst design.views design.dpi design.physicalDimensions')
      .skip(skip)
      .limit(limit)
      .lean(),
    CatalogProduct.countDocuments(filter),
  ]);

  await hydrateMockupsAndInventoryForProducts(products, { includeMockups: true, includeInventory: true });
  // Attributes are explicitly opt-in for listings (avoid overfetching).
  await hydrateAttributesForProducts(products, { includeAttributes });

  return {
    data: products.map(toCatalogSummaryDTO),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

/**
 * Returns full catalog detail for the admin designer view.
 * Strips internal-only fields before returning.
 */
async function getCatalogProductDetail(catalogProductId) {
  const product = await CatalogProduct.findOne({
    _id: catalogProductId,
    isActive: true,
    isPublished: true,
  }).lean();

  if (!product) throw new NotFoundError('CatalogProduct');

  // Backward-compatible hydration: if embedded fields are missing, pull from extracted collections.
  await hydrateMockupsAndInventoryForProducts([product], { includeMockups: true, includeInventory: true });
  await hydrateAttributesForProducts([product], { includeAttributes: true });

  return toCatalogDetailDTO(product);
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'One Size'];

/**
 * Returns all active variants for a catalog product.
 * Normalizes viewImages empty strings to null.
 * Sorts by predefined size order.
 */
async function getCatalogVariants(catalogProductId, filters = {}) {
  const query = { catalogProductId, isActive: true, discontinuedAt: null };
  if (filters.color) query.color = filters.color;
  if (filters.size) query.size = filters.size;

  const variants = await CatalogProductVariant.find(query).lean();

  // Normalize empty strings to null (defense-in-depth)
  variants.forEach((v) => {
    if (!v.viewImages) return;
    ['front', 'back', 'left', 'right'].forEach((k) => {
      if (v.viewImages[k] === '') v.viewImages[k] = null;
    });
  });

  variants.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.size);
    const bi = SIZE_ORDER.indexOf(b.size);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return variants.map(toCatalogVariantDTO);
}

module.exports = {
  listCatalogProducts,
  getCatalogProductDetail,
  getCatalogVariants,
  SIZE_ORDER,
};

