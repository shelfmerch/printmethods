const mongoose = require('mongoose');
const crypto = require('crypto');

const ItemSelectionSchema = new mongoose.Schema({
  catalogProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
  },
  color: String,
  size: String,
  quantity: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  address1: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
}, { _id: false });

const KitRedemptionSchema = new mongoose.Schema({
  kitSendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KitSend',
    required: true,
    index: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  recipientName: {
    type: String,
    trim: true,
    default: '',
  },
  token: {
    type: String,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'redeemed', 'closed'],
    default: 'pending',
    index: true,
  },
  surpriseItems: {
    type: [ItemSelectionSchema],
    default: [],
  },
  surpriseAddress: {
    type: AddressSchema,
    default: () => ({}),
  },
  selectedItems: {
    type: [ItemSelectionSchema],
    default: [],
  },
  shippingAddress: {
    type: AddressSchema,
    default: () => ({}),
  },
  redeemedAt: Date,
  shippingCost: {
    type: Number,
    default: 0,
  },
  trackingNumber: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

KitRedemptionSchema.pre('validate', function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

KitRedemptionSchema.index({ kitSendId: 1, status: 1 });

module.exports = mongoose.model('KitRedemption', KitRedemptionSchema);
