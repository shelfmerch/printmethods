const mongoose = require('mongoose');

const importedOrderSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true
  },
  shopifyOrderId: {
    type: String,
    required: true
  },
  shopifyOrderName: String,
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  importedFrom: {
    type: String,
    enum: ['shopify'],
    default: 'shopify'
  },
  importedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  customer: {
    name: String,
    email: String,
    phone: String
  },
  shippingAddress: {
    name: String,
    phone: String,
    address1: String,
    address2: String,
    city: String,
    province: String,
    zip: String,
    country: String
  },
  items: [
    {
      lineItemId: String,
      title: String,
      variantTitle: String,
      sku: String,
      quantity: Number,
      shopifyProductId: String,
      shopifyVariantId: String,
      properties: [mongoose.Schema.Types.Mixed],
      mapped: {
        type: Boolean,
        default: false
      },
      mappingRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMapping',
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
      }
    }
  ],
  financialStatus: String,
  fulfillmentStatus: String,
  totalPrice: String,
  currency: String,
  rawRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopifyOrder',
    required: true
  },
  status: {
    type: String,
    enum: ['imported', 'needs_mapping', 'ready_for_job', 'job_created'],
    default: 'imported',
    index: true
  }
}, { timestamps: true });

// Unique per shop + Shopify order id
importedOrderSchema.index({ shop: 1, shopifyOrderId: 1 }, { unique: true });

module.exports = mongoose.model('ImportedOrder', importedOrderSchema);
