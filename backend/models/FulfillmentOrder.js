const mongoose = require('mongoose');

const fulfillmentOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      index: true,
    },
    shopifyOrderId: {
      type: String,
      required: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
  },
  { timestamps: true }
);

fulfillmentOrderSchema.index({ shop: 1, shopifyOrderId: 1 }, { unique: true });

module.exports = mongoose.model('FulfillmentOrder', fulfillmentOrderSchema);

