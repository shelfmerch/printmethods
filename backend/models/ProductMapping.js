const mongoose = require('mongoose');

const productMappingSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true
  },
  shopifyProductId: {
    type: String,
    required: true,
    index: true
  },
  shopifyVariantId: {
    type: String,
    required: true
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  internalProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    default: null
  },
  internalVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProductVariant',
    default: null
  },
  printAssets: {
    frontUrl: String,
    backUrl: String,
    labelUrl: String
  },
  mockupUrls: {
    type: [String],
    default: []
  },
  printMeta: {
    printType: String,
    placement: String,
    notes: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Unique per shop + Shopify variant id
productMappingSchema.index({ shop: 1, shopifyVariantId: 1 }, { unique: true });

module.exports = mongoose.model('ProductMapping', productMappingSchema);
