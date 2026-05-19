const mongoose = require('mongoose');

/** careIconId → careicons (same ref shape as catalogproducts). */
const StoreProductCareInstructionIconSchema = new mongoose.Schema({
  careIconId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareIcon', required: true },
  label: { type: String, default: '' },
}, { _id: false });

/** Top-level fields removed from storeproducts — variants live in storeproductvariants. */
const DEPRECATED_STORE_PRODUCT_UNSET = {
  variantsSummary: 1,
  galleryImages: 1,
  source: 1,
  tags: 1,
  catalogSnapshot: 1,
  channel: 1,
  'designData.galleryImages': 1,
};

const DEPRECATED_STORE_PRODUCT_TOP_LEVEL = Object.keys(DEPRECATED_STORE_PRODUCT_UNSET).filter(
  (k) => !k.includes('.'),
);

function stripDeprecatedFromStoreProductDoc(doc) {
  if (!doc) return;
  for (const key of DEPRECATED_STORE_PRODUCT_TOP_LEVEL) {
    if (doc.get?.(key) !== undefined) {
      doc.set(key, undefined);
    } else if (doc[key] !== undefined) {
      delete doc[key];
    }
  }
  const designData = doc.get?.('designData') ?? doc.designData;
  if (designData && typeof designData === 'object' && designData.galleryImages !== undefined) {
    const next = { ...designData };
    delete next.galleryImages;
    if (doc.set) {
      doc.set('designData', next);
      doc.markModified?.('designData');
    } else {
      doc.designData = next;
    }
  }
}

function mergeDeprecatedUnset(update) {
  const next = update && typeof update === 'object' ? { ...update } : {};
  next.$unset = { ...DEPRECATED_STORE_PRODUCT_UNSET, ...(next.$unset || {}) };
  return next;
}

const StoreProductSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  catalogProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  designData: {
    type: Object,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  publishedAt: { type: Date },
  isActive: {
    type: Boolean,
    default: true
  },
  externalProductId: {
    type: String,
    sparse: true
  },
  lastSyncAt: {
    type: Date
  },
  careInstructions: {
    icons: { type: [StoreProductCareInstructionIconSchema], default: [] },
    text: { type: String, default: '' },
  },
}, {
  timestamps: true,
  strict: true,
});

StoreProductSchema.pre('save', function preSaveStripDeprecated(next) {
  stripDeprecatedFromStoreProductDoc(this);
  next();
});

const updateMiddleware = function preUpdateStripDeprecated(next) {
  this.setUpdate(mergeDeprecatedUnset(this.getUpdate()));
  next();
};

StoreProductSchema.pre('findOneAndUpdate', updateMiddleware);
StoreProductSchema.pre('updateOne', updateMiddleware);
StoreProductSchema.pre('updateMany', updateMiddleware);
StoreProductSchema.pre('findByIdAndUpdate', updateMiddleware);

StoreProductSchema.index(
  { storeId: 1, catalogProductId: 1 },
  { unique: false }
);

StoreProductSchema.index({ isActive: 1 });
StoreProductSchema.index({ createdAt: -1 });
StoreProductSchema.index({ storeId: 1, status: 1 });

const StoreProduct = mongoose.model('StoreProduct', StoreProductSchema);

module.exports = StoreProduct;
module.exports.DEPRECATED_STORE_PRODUCT_UNSET = DEPRECATED_STORE_PRODUCT_UNSET;
module.exports.stripDeprecatedFromStoreProductDoc = stripDeprecatedFromStoreProductDoc;
module.exports.mergeDeprecatedUnset = mergeDeprecatedUnset;
