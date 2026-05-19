const mongoose = require('mongoose');
const {
  viewImagesSchemaDefinition,
  normalizeViewImagesEmptyStrings,
} = require('../utils/viewImagesRef');

const CatalogProductVariantSchema = new mongoose.Schema({
  catalogProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
    index: true
  },
  currency: { type: String, default: 'INR' },
  sortOrder: { type: Number, default: 0 },
  stockStatus: {
    type: String,
    enum: ['unlimited', 'in_stock', 'out_of_stock'],
    default: 'unlimited',
  },
  discontinuedAt: { type: Date, default: null },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  colorHex: {
    type: String,
    required: true
  },
  // Base SKU template (merchants can override in StoreProductVariant)
  skuTemplate: {
    type: String,
    required: true
  },
  // Optional: variant-specific base price (if different from catalog base price)
  basePrice: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Per-view refs into catalogproductmockups (resolved to imageUrl on read)
  viewImages: viewImagesSchemaDefinition,
}, {
  timestamps: true
});

CatalogProductVariantSchema.pre('save', function (next) {
  normalizeViewImagesEmptyStrings(this.viewImages);
  next();
});

// Compound index: ensure unique size+color per catalog product
CatalogProductVariantSchema.index(
  { catalogProductId: 1, size: 1, color: 1 },
  { unique: true }
);

CatalogProductVariantSchema.index({ isActive: 1 });
CatalogProductVariantSchema.index({ catalogProductId: 1, isActive: 1 });
CatalogProductVariantSchema.index({ catalogProductId: 1, color: 1 });
CatalogProductVariantSchema.index({ catalogProductId: 1, size: 1 });

module.exports = mongoose.model('CatalogProductVariant', CatalogProductVariantSchema);
