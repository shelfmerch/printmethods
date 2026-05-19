const CatalogProduct = require('../models/CatalogProduct');
const CatalogProductVariant = require('../models/CatalogProductVariant');
const {
  VIEW_KEYS,
  hydrateViewImageUrlsForVariants,
} = require('../utils/viewImagesRef');
const { hydrateCatalogProductRelationsBatch } = require('../utils/catalogProductRefs');
const { NotFoundError } = require('../utils/errors');
const {
  toCatalogSummaryDTO,
  toCatalogDetailDTO,
  toCatalogVariantDTO,
} = require('../dtos/catalog.dto');

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
      .select('name shortDescription highlights categoryId subcategoryIds basePrice currency galleryImages tags isActive description shipping gst design.views design.dpi design.physicalDimensions')
      .skip(skip)
      .limit(limit)
      .lean(),
    CatalogProduct.countDocuments(filter),
  ]);

  await hydrateCatalogProductRelationsBatch(products, {
    includeMockups: true,
    includeInventory: true,
    includeAttributes,
  });

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

  await hydrateCatalogProductRelationsBatch([product], {
    includeMockups: true,
    includeInventory: true,
    includeAttributes: true,
  });

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

  variants.forEach((v) => {
    if (!v.viewImages) return;
    VIEW_KEYS.forEach((k) => {
      if (v.viewImages[k] === '') v.viewImages[k] = null;
    });
  });

  await hydrateViewImageUrlsForVariants(variants);

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
