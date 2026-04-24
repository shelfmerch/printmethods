const mongoose = require('mongoose');
const ORDER_STATUSES = ['on-hold', 'paid', 'in-production', 'shipped', 'delivered', 'fulfilled', 'cancelled', 'refunded'];

const ShipmentStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ORDER_STATUSES,
    required: true,
  },
  at: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
  },
}, { _id: false });

const DirectOrderItemSchema = new mongoose.Schema({
  catalogProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogProduct', required: true },
  productName: String,
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogProductVariant' },
  color: String,
  colorHex: String,
  size: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  decorationMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrintMethod' },
  decorationMethodName: String,
  uploadedDesignUrls: { type: [String], default: [] },
}, { _id: false });

const DirectOrderSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerEmail: { type: String, required: true },
  customerName: String,
  customerPhone: String,

  items: [DirectOrderItemSchema],

  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },

  deliveryMode: {
    type: String,
    enum: ['single_address', 'multi_country'],
    default: 'single_address',
  },
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  deliveryCountries: { type: [String], default: [] },
  deliveryNote: String,

  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'on-hold',
    index: true,
  },
  shipment: {
    carrier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    shippedAt: Date,
    deliveredAt: Date,
    statusUpdatedAt: { type: Date, default: Date.now },
    internalNotes: { type: String, default: '' },
    statusHistory: {
      type: [ShipmentStatusHistorySchema],
      default: [],
    },
  },

  payment: {
    method: { type: String, enum: ['razorpay', 'cod', 'other'], default: 'razorpay' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
}, { timestamps: true });

DirectOrderSchema.index({ merchantId: 1, createdAt: -1 });
DirectOrderSchema.index({ status: 1 });

module.exports = mongoose.model('DirectOrder', DirectOrderSchema);
