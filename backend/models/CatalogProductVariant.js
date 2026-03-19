const mongoose = require('mongoose');

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
  // Per-view base images for this variant
  viewImages: {
    front: { type: String, default: null },
    back: { type: String, default: null },
    left: { type: String, default: null },
    right: { type: String, default: null }
  }
}, {
  timestamps: true
});

CatalogProductVariantSchema.pre('save', function (next) {
  const imgs = this.viewImages;
  if (imgs) {
    if (imgs.front === '') imgs.front = null;
    if (imgs.back === '') imgs.back = null;
    if (imgs.left === '') imgs.left = null;
    if (imgs.right === '') imgs.right = null;
  }
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
