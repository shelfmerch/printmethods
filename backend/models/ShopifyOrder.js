const mongoose = require('mongoose');

const shopifyOrderSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true
  },
  // Fix: store the canonical myshopify domain alongside merchantId
  // so we can always resolve the owning merchant even if linkage changes.
  myshopifyDomain: {
    type: String,
    index: true,
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  shopifyOrderId: {
    type: String,
    required: true
  },
  orderName: String,
  orderNumber: Number,
  financialStatus: String,
  fulfillmentStatus: String,
  currency: String,
  totalPrice: String,
  customerEmail: String,
  createdAtShopify: Date,
  updatedAtShopify: Date,
  // User requested fields
  name: String,
  email: String,
  total_price: String,
  financial_status: String,
  fulfillment_status: String,
  line_items: [mongoose.Schema.Types.Mixed],
  customer: mongoose.Schema.Types.Mixed,
  shipping_address: mongoose.Schema.Types.Mixed,
  created_at: Date,
  updated_at: Date,
  raw: {
    type: mongoose.Schema.Types.Mixed // Stores full JSON from Shopify
  }
}, { timestamps: true });

// Unique per shop + Shopify order id
shopifyOrderSchema.index({ shop: 1, shopifyOrderId: 1 }, { unique: true });
// Fix: also index by myshopifyDomain so admin queries and backfills can
// efficiently look up orders by permanent store identifier.
shopifyOrderSchema.index({ myshopifyDomain: 1 });
shopifyOrderSchema.index({ createdAtShopify: -1 });
shopifyOrderSchema.index({ 'raw.email': 1 });

module.exports = mongoose.model('ShopifyOrder', shopifyOrderSchema);
