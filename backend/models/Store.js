const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true,
    uppercase: true,
  },
  country: {
    type: String,
    default: 'India',
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens']
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['native', 'shopify', 'etsy', 'woocommerce'],
    default: 'native',
    required: true
  },
  description: {
    type: String,
  },
  theme: {
    type: String,
    default: 'modern',
  },
  // For connected stores (Shopify/Etsy/WooCommerce)
  externalStoreId: {
    type: String,
    sparse: true
  },
  externalStoreName: {
    type: String
  },
  // Credentials for connected storefront platforms (not merchant PAT / public API)
  apiCredentials: {
    apiKey: { type: String, select: false },
    apiSecret: { type: String, select: false },
    accessToken: { type: String, select: false },
    webhookUrl: { type: String }
  },
  // settings: {
  //   currency: { type: String, default: 'INR' },
  //   timezone: { type: String, default: 'UTC' },
  //   logoUrl: { type: String },
  //   faviconUrl: { type: String },
  //   primaryColor: { type: String, default: '#000000' },
  //   defaultShippingCost: { type: Number, default: 0 },
  //   freeShippingThreshold: { type: Number },
  //   taxEnabled: { type: Boolean, default: false },
  //   taxRate: { type: Number, default: 0 }
  // },
  domain: {
    type: String,
    sparse: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  lastSyncAt: {
    type: Date
  },
  builder: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  useBuilder: {
    type: Boolean,
    default: false
  },
  builderLastPublishedAt: {
    type: Date
  },

  brandProfile: {
    companyName:     { type: String, trim: true, default: '' },
    website:         { type: String, trim: true },
    emailDomain:     { type: String, trim: true, lowercase: true, default: '' },
    country:         { type: String, trim: true, default: '' },
    industry:        { type: String, trim: true, default: '' },
    headcount:       { type: Number, default: 0 },
    regions:         { type: [String], default: ['India'] },
    brandGuidelines: {
      primaryColor:   { type: String, default: '#000000' },
      secondaryColor: { type: String },
      logoUrl:        { type: String },
      coverImageUrl:  { type: String }
    }
  },

  accessMode: {
    type: String,
    enum: ['public', 'invite_only', 'domain_restricted'],
    default: 'public'
  },

  subscriptionPlan: {
    type: String,
    enum: ['free', 'growth', 'enterprise', 'trial', 'starter', 'business'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trial', 'expired', 'cancelled'],
    default: 'active'
  },
  subscriptionExpiry: {
    type: Date
  },

  companyWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    sparse: true
  }
}, {
  timestamps: true
});

storeSchema.index({ merchant: 1, isActive: 1 });
storeSchema.index({ type: 1, isConnected: 1 });

module.exports = mongoose.model('Store', storeSchema);
