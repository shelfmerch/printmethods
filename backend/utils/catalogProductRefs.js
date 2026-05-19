/**
 * Catalog product ↔ side collections via ObjectId refs on catalogproducts:
 *
 * | Field on CatalogProduct      | Collection                  | Cardinality |
 * |------------------------------|-----------------------------|-------------|
 * | mockupIds[]                  | catalogproductmockups       | 1:N         |
 * | shipping.inventoryId         | catalogproductinventories   | 1:1         |
 * | attributeId                  | catalogproductattributes    | 1:1         |
 *
 * Child docs still keep productId for upserts; refs are synced after writes.
 */

const mongoose = require('mongoose');
const CatalogProductMockup = require('../models/CatalogProductMockup');
const CatalogProductInventory = require('../models/CatalogProductInventory');
const CatalogProductAttribute = require('../models/CatalogProductAttribute');
const { attributesFromNormalizedDoc } = require('./catalogAttributesMirror');

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

function mockupDocToLegacyShape(m) {
  if (!m) return null;
  return {
    id: m._id?.toString?.() || m.id,
    viewKey: m.viewKey,
    colorKey: m.colorKey || '',
    imageUrl: m.imageUrl,
    placeholders: m.placeholders || [],
    displacementSettings: m.displacementSettings,
    metadata: m.metadata,
  };
}

function inventoryDocToShippingInventory(inv) {
  if (!inv) return null;
  return {
    _id: inv._id,
    productId: inv.productId,
    currentStock: inv.currentStock,
    reservedStock: inv.reservedStock,
    incomingStock: inv.incomingStock,
    minimumQuantity: inv.minimumQuantity ?? 1,
    stockLocation: inv.stockLocation ?? '',
    lowStockAlertEnabled: inv.lowStockAlertEnabled ?? false,
    lowStockAlertEmail: inv.lowStockAlertEmail ?? '',
    lowStockThreshold: inv.lowStockThreshold ?? 10,
    outOfStockBehavior: inv.outOfStockBehavior ?? 'default',
  };
}

/** @deprecated Use shipping.inventory — kept for API compatibility during transition. */
function inventoryDocToLegacyStocks(inv) {
  const shaped = inventoryDocToShippingInventory(inv);
  if (!shaped) {
    return {
      minimumQuantity: 1,
      stockLocation: '',
      lowStockAlertEnabled: false,
      lowStockAlertEmail: '',
      lowStockThreshold: 10,
      outOfStockBehavior: 'default',
    };
  }
  const { _id, productId, ...legacy } = shaped;
  return legacy;
}

function getCatalogMinimumQuantity(product) {
  return (
    product?.shipping?.inventory?.minimumQuantity
    ?? product?.stocks?.minimumQuantity
    ?? 1
  );
}

async function loadMockupsByRef(product) {
  const ids = (product.mockupIds || []).map(resolveObjectId).filter(Boolean);
  if (ids.length) {
    return CatalogProductMockup.find({ _id: { $in: ids } })
      .select('viewKey colorKey imageUrl placeholders displacementSettings metadata')
      .sort({ 'metadata.order': 1, createdAt: 1 })
      .lean();
  }
  const pid = resolveProductId(product._id);
  if (!pid) return [];
  return CatalogProductMockup.find({ productId: pid })
    .select('viewKey colorKey imageUrl placeholders displacementSettings metadata')
    .sort({ 'metadata.order': 1, createdAt: 1 })
    .lean();
}

async function loadInventoryByRef(product) {
  const invRef = resolveObjectId(product.shipping?.inventoryId);
  if (invRef) {
    const doc = await CatalogProductInventory.findById(invRef).lean();
    if (doc) return doc;
  }
  const pid = resolveProductId(product._id);
  if (!pid) return null;
  return CatalogProductInventory.findOne({ productId: pid }).lean();
}

async function loadAttributeByRef(product) {
  const attrRef = resolveObjectId(product.attributeId);
  if (attrRef) {
    const doc = await CatalogProductAttribute.findById(attrRef).lean();
    if (doc) return doc;
  }
  const pid = resolveProductId(product._id);
  if (!pid) return null;
  return CatalogProductAttribute.findOne({ productId: pid }).lean();
}

async function loadMockupDocsForProduct(productId) {
  return loadMockupsByRef({ _id: productId });
}

async function loadInventoryDocForProduct(productId) {
  return loadInventoryByRef({ _id: productId });
}

async function loadAttributeDocForProduct(productId) {
  return loadAttributeByRef({ _id: productId });
}

async function loadAttributesForProduct(productId) {
  const doc = await loadAttributeDocForProduct(productId);
  return attributesFromNormalizedDoc(doc) || {};
}

/**
 * Sync ObjectId refs on catalogproducts from child rows (by productId).
 */
async function syncCatalogProductRelationRefs(productOrId) {
  const CatalogProduct = require('../models/CatalogProduct');
  const id = resolveProductId(productOrId);
  if (!id) return null;

  const [inv, attr, mockups] = await Promise.all([
    CatalogProductInventory.findOne({ productId: id }).select('_id').lean(),
    CatalogProductAttribute.findOne({ productId: id }).select('_id').lean(),
    CatalogProductMockup.find({ productId: id }).select('_id').lean(),
  ]);

  const $set = {
    mockupIds: mockups.map((m) => m._id),
  };
  if (attr?._id) $set.attributeId = attr._id;
  if (inv?._id) $set['shipping.inventoryId'] = inv._id;

  const updated = await CatalogProduct.findByIdAndUpdate(
    id,
    { $set },
    { new: true },
  ).lean();

  return updated;
}

function attachInventoryToShipping(product, inv) {
  product.shipping = product.shipping || {};
  if (inv?._id) {
    product.shipping.inventoryId = inv._id;
    product.shipping.inventory = inventoryDocToShippingInventory(inv);
  }
}

/**
 * Hydrate relations via ObjectId refs (shipping.inventoryId, attributeId, mockupIds).
 */
async function hydrateCatalogProductRelations(product, options = {}) {
  const {
    includeMockups = true,
    includeInventory = true,
    includeAttributes = false,
    legacyStocksAlias = true,
  } = options;

  if (!product || !product._id) return product;

  const [mockups, inv, attrDoc] = await Promise.all([
    includeMockups ? loadMockupsByRef(product) : Promise.resolve([]),
    includeInventory ? loadInventoryByRef(product) : Promise.resolve(null),
    includeAttributes ? loadAttributeByRef(product) : Promise.resolve(null),
  ]);

  if (includeMockups) {
    product.mockupIds = mockups.map((m) => m._id);
    product.design = product.design || {};
    product.design.sampleMockups = mockups.map(mockupDocToLegacyShape);
  }

  if (includeInventory) {
    attachInventoryToShipping(product, inv);
    if (legacyStocksAlias) {
      product.stocks = inventoryDocToLegacyStocks(inv);
    }
  }

  if (includeAttributes && attrDoc) {
    product.attributeId = attrDoc._id;
    const mirrored = attributesFromNormalizedDoc(attrDoc);
    if (mirrored && Object.keys(mirrored).length > 0) {
      product.attributes = mirrored;
    }
  }

  return product;
}

async function hydrateCatalogProductRelationsBatch(products, options = {}) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const {
    includeMockups = true,
    includeInventory = true,
    includeAttributes = false,
    legacyStocksAlias = true,
  } = options;

  const inventoryIds = products
    .map((p) => resolveObjectId(p.shipping?.inventoryId))
    .filter(Boolean);
  const attributeIds = products
    .map((p) => resolveObjectId(p.attributeId))
    .filter(Boolean);
  const mockupIdLists = includeMockups
    ? products.flatMap((p) => (p.mockupIds || []).map(resolveObjectId).filter(Boolean))
    : [];
  const needsProductIdFallback = products.filter(
    (p) =>
      (includeInventory && !resolveObjectId(p.shipping?.inventoryId))
      || (includeAttributes && !resolveObjectId(p.attributeId))
      || (includeMockups && !(p.mockupIds || []).length),
  );
  const fallbackProductIds = needsProductIdFallback.map((p) => p._id).filter(Boolean);

  const [mockupsById, inventoriesById, attrsById, mockupsByProduct, inventoriesByProduct, attrsByProduct] =
    await Promise.all([
      includeMockups && mockupIdLists.length
        ? CatalogProductMockup.find({ _id: { $in: mockupIdLists } })
          .select('viewKey colorKey imageUrl placeholders displacementSettings metadata')
          .lean()
        : Promise.resolve([]),
      includeInventory && inventoryIds.length
        ? CatalogProductInventory.find({ _id: { $in: inventoryIds } }).lean()
        : Promise.resolve([]),
      includeAttributes && attributeIds.length
        ? CatalogProductAttribute.find({ _id: { $in: attributeIds } }).lean()
        : Promise.resolve([]),
      includeMockups && fallbackProductIds.length
        ? CatalogProductMockup.find({ productId: { $in: fallbackProductIds } })
          .select('productId viewKey colorKey imageUrl placeholders displacementSettings metadata')
          .lean()
        : Promise.resolve([]),
      includeInventory && fallbackProductIds.length
        ? CatalogProductInventory.find({ productId: { $in: fallbackProductIds } }).lean()
        : Promise.resolve([]),
      includeAttributes && fallbackProductIds.length
        ? CatalogProductAttribute.find({ productId: { $in: fallbackProductIds } }).lean()
        : Promise.resolve([]),
    ]);

  const mockupDocById = new Map(mockupsById.map((m) => [String(m._id), m]));
  const invById = new Map(inventoriesById.map((i) => [String(i._id), i]));
  const attrById = new Map(attrsById.map((a) => [String(a._id), a]));

  const mockupsByProductId = new Map();
  for (const m of mockupsByProduct) {
    const key = String(m.productId);
    const arr = mockupsByProductId.get(key) || [];
    arr.push(m);
    mockupsByProductId.set(key, arr);
  }
  const invByProductId = new Map(inventoriesByProduct.map((i) => [String(i.productId), i]));
  const attrByProductId = new Map(attrsByProduct.map((a) => [String(a.productId), a]));

  for (const p of products) {
    const key = String(p._id);

    if (includeMockups) {
      let mockups = [];
      if ((p.mockupIds || []).length) {
        mockups = (p.mockupIds || [])
          .map((id) => mockupDocById.get(String(id)))
          .filter(Boolean);
      } else {
        mockups = mockupsByProductId.get(key) || [];
      }
      p.mockupIds = mockups.map((m) => m._id);
      p.design = p.design || {};
      p.design.sampleMockups = mockups.map(mockupDocToLegacyShape);
    }

    if (includeInventory) {
      let inv = null;
      const invId = resolveObjectId(p.shipping?.inventoryId);
      if (invId) inv = invById.get(String(invId)) || null;
      if (!inv) inv = invByProductId.get(key) || null;
      attachInventoryToShipping(p, inv);
      if (legacyStocksAlias) {
        p.stocks = inventoryDocToLegacyStocks(inv);
      }
    }

    if (includeAttributes) {
      let attrDoc = null;
      const attrId = resolveObjectId(p.attributeId);
      if (attrId) attrDoc = attrById.get(String(attrId)) || null;
      if (!attrDoc) attrDoc = attrByProductId.get(key) || null;
      if (attrDoc) {
        p.attributeId = attrDoc._id;
        const mirrored = attributesFromNormalizedDoc(attrDoc);
        if (mirrored && Object.keys(mirrored).length > 0) {
          p.attributes = mirrored;
        }
      }
    }
  }

  return products;
}

function stripDeprecatedEmbeddedFields(product) {
  if (!product) return;
  if (product.attributes !== undefined) {
    product.set?.('attributes', undefined);
    delete product.attributes;
  }
  if (product.stocks !== undefined) {
    product.set?.('stocks', undefined);
    delete product.stocks;
  }
  if (product.design?.sampleMockups !== undefined) {
    const design = { ...(product.design.toObject?.() || product.design) };
    delete design.sampleMockups;
    product.design = design;
    product.markModified?.('design');
  }
}

function designInputWithoutSampleMockups(design) {
  if (!design || typeof design !== 'object') return design;
  const { sampleMockups, ...rest } = design;
  return rest;
}

async function loadCatalogProductWithRelations(productId, options = {}) {
  const CatalogProduct = require('../models/CatalogProduct');
  const product = await CatalogProduct.findById(productId).lean();
  if (!product) return null;
  await hydrateCatalogProductRelations(product, options);
  return product;
}

module.exports = {
  resolveProductId,
  resolveObjectId,
  mockupDocToLegacyShape,
  inventoryDocToShippingInventory,
  inventoryDocToLegacyStocks,
  getCatalogMinimumQuantity,
  loadMockupDocsForProduct,
  loadInventoryDocForProduct,
  loadAttributeDocForProduct,
  loadAttributesForProduct,
  syncCatalogProductRelationRefs,
  hydrateCatalogProductRelations,
  hydrateCatalogProductRelationsBatch,
  loadCatalogProductWithRelations,
  stripDeprecatedEmbeddedFields,
  designInputWithoutSampleMockups,
};
