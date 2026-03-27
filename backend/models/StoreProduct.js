const mongoose = require('mongoose');

const StoreProductGalleryImageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  position: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false },
  imageType: {
    type: String,
    enum: ['lifestyle', 'flat-front', 'flat-back', 'size-chart', 'detail', 'mockup', 'other'],
    default: 'other',
  },
  altText: { type: String, default: '' },
}, { _id: false });

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
  // Optional: store-specific overrides
  title: {
    type: String, // If null, use CatalogProduct.name
    trim: true
  },
  description: {
    type: String // If null, use CatalogProduct.description
  },
  // Merchant's selling price (what customers pay)
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // Optional: compare at price (for showing discounts)
  compareAtPrice: {
    type: Number,
    min: 0
  },
  tags: { type: [String], default: [] },
  // Optional: summary of variant-level pricing embedded on the StoreProduct
  // This mirrors data from StoreProductVariant + CatalogProductVariant so that
  // storefronts and dashboards can quickly read per-variant size/color/pricing
  // without needing an additional query.
  variantsSummary: [{
    catalogProductVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CatalogProductVariant',
      required: true,
    },
    size: {
      type: String,
    },
    color: {
      type: String,
    },
    colorHex: {
      type: String,
    },
    sku: {
      type: String,
    },
    // Variant-level selling price for this store product
    sellingPrice: {
      type: Number,
      min: 0,
    },
    // Production cost for this variant (CatalogProductVariant.basePrice)
    basePrice: {
      type: Number,
      min: 0,
    },
    // Whether this variant is currently in stock (derived from catalog + store variant isActive)
    isActive: {
      type: Boolean,
      default: true,
    },
  }],

  // Custom design and properties saved from the design editor
  designData: {
    type: Object,
  },

  galleryImages: { type: [StoreProductGalleryImageSchema], default: [] },

  catalogSnapshot: {
    name: { type: String },
    category: { type: String },
    material: { type: String },
    shipping_weight_grams: { type: Number },
    gst_slab: { type: Number },
    dpi: { type: Number, default: 300 },
  },

  source: {
    type: String,
    enum: ['native', 'api'],
    default: 'native',
    index: true,
  },
  // Publication status
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  publishedAt: { type: Date },
  // Active status in this store
  isActive: {
    type: Boolean,
    default: true
  },
  // For connected stores: external product ID
  externalProductId: {
    type: String,
    sparse: true
  },
  // Last sync with external platform
  lastSyncAt: {
    type: Date
  },
  careInstructions: {
    icons: [{
      type: { type: String, enum: ['predefined', 'custom'], default: 'predefined' },
      iconKey: String,
      iconUrl: String,
      label: String,
    }],
    text: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Compound index: allow multiple StoreProducts per store+catalogProduct
// This enables merchants to have multiple separate listings of the same base item
StoreProductSchema.index(
  { storeId: 1, catalogProductId: 1 },
  { unique: false }
);

StoreProductSchema.index({ isActive: 1 });
StoreProductSchema.index({ createdAt: -1 });
StoreProductSchema.index({ storeId: 1, status: 1 });
StoreProductSchema.index({ storeId: 1, source: 1 });
StoreProductSchema.index({ 'variantsSummary.catalogProductVariantId': 1 });

module.exports = mongoose.model('StoreProduct', StoreProductSchema);
