/**
 * Store product ↔ catalog / care icon references (no duplicated tags on storeproducts).
 *
 * - Tags: read via populate('catalogProductId') → CatalogProduct.tags
 * - Care: storeproducts.careInstructions.icons[].careIconId → careicons (ref-only, synced from catalog on save)
 */

const mongoose = require('mongoose');
const CatalogProduct = require('../models/CatalogProduct');
const StoreProductVariant = require('../models/StoreProductVariant');
const {
  loadCatalogCareInstructionRefs,
  expandCareInstructionsForApi,
} = require('./careInstructionsRefs');
const { hydrateCatalogProductRelations } = require('./catalogProductRefs');

const CATALOG_VARIANT_LIST_SELECT = 'size color colorHex basePrice skuTemplate isActive';

/** Populate catalogProductId with these fields (includes tags). */
const CATALOG_REF_SELECT =
  '_id name description categoryId subcategoryIds productTypeCode tags gst careInstructions design shipping attributeId mockupIds';

function resolveCatalogId(ref) {
  if (!ref) return null;
  if (mongoose.Types.ObjectId.isValid(String(ref))) {
    return new mongoose.Types.ObjectId(String(ref));
  }
  if (typeof ref === 'object' && ref._id) {
    return new mongoose.Types.ObjectId(String(ref._id));
  }
  return null;
}

/** Copy catalog care refs onto store product before save (careIconId only in MongoDB). */
async function syncStoreProductCareFromCatalog(storeProduct) {
  const catalogId =
    resolveCatalogId(storeProduct?.catalogProductId) ||
    resolveCatalogId(storeProduct?.catalogProductId?._id);
  const refs = await loadCatalogCareInstructionRefs(catalogId);
  if (storeProduct) {
    storeProduct.careInstructions = refs;
    storeProduct.markModified?.('careInstructions');
  }
  return refs;
}

/** Tags from populated catalogProductId (not stored on storeproducts). */
function tagsFromCatalogPopulate(doc) {
  const cat = doc?.catalogProductId;
  if (cat && typeof cat === 'object' && Array.isArray(cat.tags)) {
    return cat.tags;
  }
  return [];
}

function toPlain(doc) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete plain.variantsSummary;
  delete plain.galleryImages;
  delete plain.source;
  delete plain.tags;
  delete plain.catalogSnapshot;
  delete plain.channel;
  if (plain.designData && typeof plain.designData === 'object') {
    delete plain.designData.galleryImages;
  }
  return plain;
}

async function hydratePopulatedCatalogRef(catalogRef) {
  if (!catalogRef || typeof catalogRef !== 'object' || !catalogRef._id) return catalogRef;
  const plain = typeof catalogRef.toObject === 'function' ? catalogRef.toObject() : { ...catalogRef };
  await hydrateCatalogProductRelations(plain, {
    includeMockups: true,
    includeInventory: true,
    includeAttributes: false,
  });
  return plain;
}

/** API shape: tags from catalog ref + hydrate care icons from careicons collection. */
async function shapeStoreProductForApi(doc) {
  const plain = toPlain(doc);
  if (plain.catalogProductId && typeof plain.catalogProductId === 'object') {
    plain.catalogProductId = await hydratePopulatedCatalogRef(plain.catalogProductId);
  }
  plain.tags = tagsFromCatalogPopulate(plain);
  plain.careInstructions = await expandCareInstructionsForApi(
    plain.careInstructions || { text: '', icons: [] },
  );
  return plain;
}

async function shapeStoreProductsForApi(docs) {
  if (!docs) return docs;
  return Promise.all((docs || []).map((d) => shapeStoreProductForApi(d)));
}

/** List APIs: tags from catalog populate; care stays ref-only in JSON. */
async function shapeStoreProductForList(doc) {
  const plain = toPlain(doc);
  if (plain.catalogProductId && typeof plain.catalogProductId === 'object') {
    plain.catalogProductId = await hydratePopulatedCatalogRef(plain.catalogProductId);
  }
  plain.tags = tagsFromCatalogPopulate(plain);
  return plain;
}

async function shapeStoreProductsForList(docs) {
  if (!docs) return docs;
  return Promise.all((docs || []).map((d) => shapeStoreProductForList(d)));
}

/** Join store + catalog variant fields for API responses (not persisted on StoreProduct). */
function buildVariantsFromStoreProductVariants(storeVariants) {
  return (storeVariants || [])
    .filter((sv) => sv.catalogProductVariantId)
    .map((sv) => {
      const cv = sv.catalogProductVariantId;
      return {
        catalogProductVariantId: cv._id,
        size: cv.size,
        color: cv.color,
        colorHex: cv.colorHex,
        sku: sv.sku || cv.skuTemplate,
        sellingPrice: typeof sv.sellingPrice === 'number' ? sv.sellingPrice : undefined,
        basePrice: typeof cv.basePrice === 'number' ? cv.basePrice : undefined,
        isActive: sv.isActive !== false && cv.isActive !== false,
      };
    });
}

/** Attach computed `variants` array to lean store product list docs. */
async function attachVariantsToStoreProducts(products) {
  if (!products?.length) return products;

  const productIds = products.map((p) => p._id);
  const storeVariants = await StoreProductVariant.find({
    storeProductId: { $in: productIds },
  })
    .populate({
      path: 'catalogProductVariantId',
      select: CATALOG_VARIANT_LIST_SELECT,
    })
    .lean();

  const variantsByProduct = {};
  storeVariants.forEach((sv) => {
    const spId = sv.storeProductId.toString();
    if (!variantsByProduct[spId]) variantsByProduct[spId] = [];
    variantsByProduct[spId].push(sv);
  });

  products.forEach((product) => {
    const spId = product._id.toString();
    product.variants = buildVariantsFromStoreProductVariants(variantsByProduct[spId] || []);
  });

  return products;
}

module.exports = {
  CATALOG_REF_SELECT,
  hydratePopulatedCatalogRef,
  resolveCatalogId,
  syncStoreProductCareFromCatalog,
  tagsFromCatalogPopulate,
  shapeStoreProductForApi,
  shapeStoreProductsForApi,
  shapeStoreProductForList,
  shapeStoreProductsForList,
  buildVariantsFromStoreProductVariants,
  attachVariantsToStoreProducts,
};
