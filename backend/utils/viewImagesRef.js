const mongoose = require('mongoose');
const CatalogProductMockup = require('../models/CatalogProductMockup');

const VIEW_KEYS = ['front', 'back', 'left', 'right'];

const mockupRefField = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'CatalogProductMockup',
  default: null,
};

/**
 * Subdocument shape for CatalogProductVariant.viewImages (ObjectId refs).
 */
const viewImagesSchemaDefinition = {
  front: { ...mockupRefField },
  back: { ...mockupRefField },
  left: { ...mockupRefField },
  right: { ...mockupRefField },
};

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value) && String(value).length === 24;
}

function isUrlString(value) {
  return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
}

/**
 * Normalize empty strings on viewImages slots (in-place).
 */
function normalizeViewImagesEmptyStrings(viewImages) {
  if (!viewImages) return;
  for (const key of VIEW_KEYS) {
    if (viewImages[key] === '') viewImages[key] = null;
  }
}

/**
 * Resolve a single slot (URL, ObjectId string, or populated doc) to a mockup _id.
 */
async function resolveSlotToMockupId(value, { productId, color, viewKey }) {
  if (value == null || value === '') return null;

  if (value && typeof value === 'object' && value._id) {
    return value._id;
  }

  if (isObjectId(value)) {
    const exists = await CatalogProductMockup.findById(value).select('_id').lean();
    return exists ? new mongoose.Types.ObjectId(value) : null;
  }

  if (!isUrlString(value)) return null;

  const colorKey = color || '';
  let mockup = await CatalogProductMockup.findOne({
    productId,
    colorKey,
    viewKey,
  });

  if (mockup) {
    if (mockup.imageUrl !== value) {
      mockup.imageUrl = value;
      await mockup.save();
    }
    return mockup._id;
  }

  mockup = await CatalogProductMockup.create({
    productId,
    colorKey,
    viewKey,
    imageUrl: value,
    placeholders: [],
    metadata: { imageType: 'other', caption: '', order: 0 },
  });
  return mockup._id;
}

/**
 * Convert incoming viewImages (URLs or mockup ids) to ObjectId refs for persistence.
 */
async function resolveViewImagesToMockupIds(viewImages, { catalogProductId, color }) {
  if (!viewImages || typeof viewImages !== 'object') {
    return { front: null, back: null, left: null, right: null };
  }

  const productId = catalogProductId;
  const resolved = {};

  await Promise.all(
    VIEW_KEYS.map(async (viewKey) => {
      resolved[viewKey] = await resolveSlotToMockupId(viewImages[viewKey], {
        productId,
        color,
        viewKey,
      });
    })
  );

  return resolved;
}

const VIEW_IMAGES_POPULATE = VIEW_KEYS.map((key) => ({
  path: `viewImages.${key}`,
  select: 'imageUrl viewKey colorKey productId',
}));

/**
 * After populate (or lean + manual hydrate), map viewImages to image URL strings for API clients.
 */
function viewImagesToUrlMap(variant, mockupUrlById) {
  const out = { front: null, back: null, left: null, right: null };
  const vi = variant?.viewImages;
  if (!vi) return out;

  for (const key of VIEW_KEYS) {
    const slot = vi[key];
    if (slot == null || slot === '') {
      out[key] = null;
      continue;
    }
    if (typeof slot === 'string') {
      if (isUrlString(slot)) {
        out[key] = slot;
      } else if (isObjectId(slot) && mockupUrlById) {
        out[key] = mockupUrlById.get(String(slot)) || null;
      } else {
        out[key] = null;
      }
      continue;
    }
    if (slot.imageUrl) {
      out[key] = slot.imageUrl;
      continue;
    }
    if (slot._id && mockupUrlById) {
      out[key] = mockupUrlById.get(String(slot._id)) || null;
    }
  }

  return out;
}

/**
 * Batch-load mockup imageUrls for variants (handles unpopulated ObjectId refs and legacy URL strings).
 */
async function hydrateViewImageUrlsForVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return variants;

  const mockupIds = new Set();
  for (const v of variants) {
    const vi = v.viewImages;
    if (!vi) continue;
    for (const key of VIEW_KEYS) {
      const slot = vi[key];
      if (slot && isObjectId(slot)) mockupIds.add(String(slot));
    }
  }

  const mockupUrlById = new Map();
  if (mockupIds.size > 0) {
    const mockups = await CatalogProductMockup.find({ _id: { $in: [...mockupIds] } })
      .select('imageUrl')
      .lean();
    for (const m of mockups) {
      mockupUrlById.set(String(m._id), m.imageUrl);
    }
  }

  for (const v of variants) {
    v.viewImages = viewImagesToUrlMap(v, mockupUrlById);
  }

  return variants;
}

function applyViewImagesUrlsToVariantObject(variantObj) {
  if (!variantObj?.viewImages) return variantObj;
  const vi = variantObj.viewImages;
  const hasPopulated = VIEW_KEYS.some(
    (k) => vi[k] && typeof vi[k] === 'object' && vi[k].imageUrl
  );
  if (hasPopulated) {
    variantObj.viewImages = viewImagesToUrlMap(variantObj);
    return variantObj;
  }
  return variantObj;
}

module.exports = {
  VIEW_KEYS,
  viewImagesSchemaDefinition,
  VIEW_IMAGES_POPULATE,
  normalizeViewImagesEmptyStrings,
  resolveViewImagesToMockupIds,
  resolveSlotToMockupId,
  viewImagesToUrlMap,
  hydrateViewImageUrlsForVariants,
  applyViewImagesUrlsToVariantObject,
  isObjectId,
  isUrlString,
};
