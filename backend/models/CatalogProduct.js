const mongoose = require('mongoose');
const { isValidCategory } = require('../config/productCategories');

/** Legacy embedded copies — use attributeId, mockupIds, shipping.inventoryId instead. */
const DEPRECATED_CATALOG_PRODUCT_UNSET = {
  attributes: 1,
  stocks: 1,
  'design.sampleMockups': 1,
};

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

function mergeDeprecatedCatalogUnset(update) {
  const next = update && typeof update === 'object' ? { ...update } : {};
  next.$unset = { ...DEPRECATED_CATALOG_PRODUCT_UNSET, ...(next.$unset || {}) };
  return next;
}

const PlaceholderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  xIn: { type: Number, required: true },
  yIn: { type: Number, required: true },
  widthIn: { type: Number },
  heightIn: { type: Number },
  rotationDeg: { type: Number, default: 0 },
  scale: { type: Number, default: 1.0 },
  lockSize: { type: Boolean, default: false },
  shapeType: { type: String, enum: ['rect', 'polygon'], default: 'rect' },
  polygonPoints: {
    type: [{
      xIn: { type: Number, required: true },
      yIn: { type: Number, required: true },
    }],
    default: undefined,
  },
}, { _id: false });

const ViewConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    enum: ['front', 'back', 'left', 'right'],
  },
  mockupImageUrl: { type: String, required: true },
  placeholders: { type: [PlaceholderSchema], default: [] },
}, { _id: false });

/** Editor canvas config only — sample mockups live in catalogproductmockups (productId → CatalogProduct). */
const CatalogProductDesignSchema = new mongoose.Schema({
  views: [ViewConfigSchema],
  dpi: { type: Number, default: 300 },
  physicalDimensions: {
    width: { type: Number },
    height: { type: Number },
    length: { type: Number },
  },
  displacementSettings: {
    scaleX: { type: Number, default: 20 },
    scaleY: { type: Number, default: 20 },
    contrastBoost: { type: Number, default: 1.5 },
  },
}, { _id: false });

const CatalogCareInstructionIconSchema = new mongoose.Schema({
  careIconId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareIcon', required: true },
  label: { type: String, default: '' },
}, { _id: false });

const CatalogProductShippingSchema = new mongoose.Schema({
  packageLengthCm: { type: Number, required: true },
  packageWidthCm: { type: Number, required: true },
  packageHeightCm: { type: Number, required: true },
  packageWeightGrams: { type: Number, required: true },
  deliveryTimeOption: {
    type: String,
    enum: ['none', 'default', 'specific'],
    default: 'specific',
  },
  inStockDeliveryTime: { type: String, default: '' },
  outOfStockDeliveryTime: { type: String, default: '' },
  additionalShippingCost: { type: Number, default: 0 },
  carrierSelection: {
    type: String,
    enum: ['all', 'selected'],
    default: 'all',
  },
  selectedCarriers: { type: [String], default: [] },
  /** ObjectId ref → catalogproductinventories (stock policy / MOQ). */
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProductInventory',
    default: null,
  },
}, { _id: false });

const CatalogProductGalleryImageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  position: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
  imageType: {
    type: String,
    enum: ['lifestyle', 'flat-front', 'flat-back', 'size-chart', 'detail', 'other'],
    default: 'other',
  },
  altText: { type: String, default: '' },
}, { _id: false });

const ProductPricingSchema = new mongoose.Schema({
  retailPriceTaxExcl: { type: Number, default: 0 },
  taxRule: { type: String, default: '' },
  taxRate: { type: Number, default: 0 },
  retailPriceTaxIncl: { type: Number, default: 0 },
  costPriceTaxExcl: { type: Number, default: 0 },
  /** ObjectId refs → catalogproductprices (hydrated on API read). */
  specificPrices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProductPrice',
  }],
}, { _id: false });

const CatalogProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: { type: String },
  shortDescription: { type: String, default: '' },
  highlights: { type: [String], default: [] },
  categoryId: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return isValidCategory(v);
      },
      message: (props) => `${props.value} is not a valid category ID`,
    },
  },
  subcategoryIds: [String],
  productTypeCode: { type: String, required: true },
  tags: [String],

  basePrice: { type: Number, required: true, min: 0 },
  sampleAvailable: { type: Boolean, default: false },
  currency: { type: String, default: 'INR' },

  gst: {
    slab: { type: Number, enum: [0, 5, 12, 18], default: 18 },
    mode: { type: String, enum: ['EXCLUSIVE', 'INCLUSIVE'], default: 'EXCLUSIVE' },
    hsn: { type: String, default: '' },
  },

  allowedPrintMethodIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrintMethod',
  }],

  design: {
    type: CatalogProductDesignSchema,
    required: true,
  },

  shipping: {
    type: CatalogProductShippingSchema,
    required: true,
  },

  fulfillmentType: {
    type: String,
    enum: ['print_on_demand', 'inventory'],
    default: 'print_on_demand',
    index: true,
  },

  productionHours: { type: Number, default: 120, min: 1 },

  galleryImages: [CatalogProductGalleryImageSchema],

  pricing: {
    type: ProductPricingSchema,
    default: () => ({}),
  },

  details: {
    mpn: { type: String, default: '' },
    upc: { type: String, default: '' },
    ean13: { type: String, default: '' },
    isbn: { type: String, default: '' },
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },

  careInstructions: {
    icons: { type: [CatalogCareInstructionIconSchema], default: [] },
    text: { type: String, default: '' },
  },

  /** ObjectId refs → side collections (canonical relations on catalogproducts). */
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProductAttribute',
    default: null,
    index: true,
  },
  mockupIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProductMockup',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ——— Populate helpers (localField = ObjectId ref on this document) ———

CatalogProductSchema.virtual('mockupDocs', {
  ref: 'CatalogProductMockup',
  localField: 'mockupIds',
  foreignField: '_id',
});

CatalogProductSchema.virtual('inventoryDoc', {
  ref: 'CatalogProductInventory',
  localField: 'shipping.inventoryId',
  foreignField: '_id',
  justOne: true,
});

CatalogProductSchema.virtual('attributeDoc', {
  ref: 'CatalogProductAttribute',
  localField: 'attributeId',
  foreignField: '_id',
  justOne: true,
});

CatalogProductSchema.virtual('variantDocs', {
  ref: 'CatalogProductVariant',
  localField: '_id',
  foreignField: 'catalogProductId',
});

CatalogProductSchema.pre('save', function preSaveStripDeprecatedCatalog(next) {
  stripDeprecatedEmbeddedFields(this);
  next();
});

const catalogUpdateMiddleware = function preUpdateStripDeprecatedCatalog(next) {
  this.setUpdate(mergeDeprecatedCatalogUnset(this.getUpdate()));
  next();
};

CatalogProductSchema.pre('findOneAndUpdate', catalogUpdateMiddleware);
CatalogProductSchema.pre('updateOne', catalogUpdateMiddleware);
CatalogProductSchema.pre('updateMany', catalogUpdateMiddleware);
CatalogProductSchema.pre('findByIdAndUpdate', catalogUpdateMiddleware);

CatalogProductSchema.index({ name: 'text', description: 'text' });
CatalogProductSchema.index({ createdBy: 1 });
CatalogProductSchema.index({ isActive: 1, isPublished: 1 });
CatalogProductSchema.index({ createdAt: -1 });
CatalogProductSchema.index({ categoryId: 1 });
CatalogProductSchema.index({ productTypeCode: 1 });

const CatalogProduct = mongoose.model('CatalogProduct', CatalogProductSchema);

module.exports = CatalogProduct;
module.exports.DEPRECATED_CATALOG_PRODUCT_UNSET = DEPRECATED_CATALOG_PRODUCT_UNSET;
