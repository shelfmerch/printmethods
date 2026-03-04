const mongoose = require('mongoose');

const productionJobSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true
  },
  importedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImportedOrder',
    required: true
  },
  shopifyOrderId: {
    type: String,
    required: true
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
      title: String,
      variantTitle: String,
      sku: String,
      quantity: Number,
      shopifyProductId: String,
      shopifyVariantId: String,
      printAssets: {
        frontUrl: String,
        backUrl: String,
        labelUrl: String
      },
      mockupUrls: [String]
    }
  ],
  status: {
    type: String,
    enum: ['queued', 'manufacturing', 'qc', 'packed', 'shipped', 'delivered', 'failed'],
    default: 'queued',
    index: true
  },
  shipping: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    shippedAt: Date
  }
}, { timestamps: true });

// Unique per shop + Shopify order id for idempotency
productionJobSchema.index({ shop: 1, shopifyOrderId: 1 }, { unique: true });
productionJobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ProductionJob', productionJobSchema);
