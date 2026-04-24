const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  address1: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
}, { _id: false });

const RecipientSelectionSchema = new mongoose.Schema({
  catalogProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
  },
  color: String,
  size: String,
  quantity: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const SurpriseRecipientSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  recipientName: {
    type: String,
    trim: true,
  },
  address: {
    type: AddressSchema,
    default: () => ({}),
  },
  selections: {
    type: [RecipientSelectionSchema],
    default: [],
  },
}, { _id: false });

const OverageItemSchema = new mongoose.Schema({
  catalogProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CatalogProduct',
    required: true,
  },
  overageQty: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const KitSendSchema = new mongoose.Schema({
  kitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kit',
    required: true,
    index: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
  },
  deliveryMode: {
    type: String,
    enum: ['redeem', 'surprise'],
    required: true,
  },
  fromName: {
    type: String,
    trim: true,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  sendInviteAt: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate',
  },
  scheduledAt: Date,
  recipientCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  recipientEmails: {
    type: [String],
    default: [],
  },
  surpriseRecipients: {
    type: [SurpriseRecipientSchema],
    default: [],
  },
  itemsCostPerRecipient: {
    type: Number,
    default: 0,
  },
  serviceFee: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  overageItems: {
    type: [OverageItemSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['pending_payment', 'paid', 'invites_sent', 'partially_redeemed', 'completed', 'closed'],
    default: 'pending_payment',
    index: true,
  },
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
}, {
  timestamps: true,
});

KitSendSchema.index({ brandId: 1, createdAt: -1 });

module.exports = mongoose.model('KitSend', KitSendSchema);
