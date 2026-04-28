const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Top-level currency and country for public API shop creation
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
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
  // Top-level currency and country for public API / onboarding flow
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
  // Merchant-facing status (mirrors isActive but as a string for API DTO)
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  // Optional basic branding fields
  description: {
    type: String,
  },
  theme: {
    type: String,
    default: 'modern',
  },
  // For connected stores (Shopify/Etsy/WooCommerce)
  externalStoreId: {
    type: String, // Store ID from external platform
    sparse: true // Only required for connected stores
  },
  externalStoreName: {
    type: String // Store name from external platform
  },
  // API credentials for connected stores (encrypted in production)
  apiCredentials: {
    apiKey: { type: String, select: false },
    apiSecret: { type: String, select: false },
    accessToken: { type: String, select: false },
    webhookUrl: { type: String }
  },
  // Store settings
  settings: {
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'UTC' },
    logoUrl: { type: String },
    faviconUrl: { type: String },
    primaryColor: { type: String, default: '#000000' },
    // Shipping defaults
    defaultShippingCost: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number },
    // Tax settings
    taxEnabled: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 }
  },
  // Domain/subdomain for native stores
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
    default: false // For connected stores, true when API is working
  },
  lastSyncAt: {
    type: Date // Last sync with external platform
  },
  // Store Builder fields
  builder: {
    type: mongoose.Schema.Types.Mixed, // Full StoreBuilder object
    default: null
  },
  useBuilder: {
    type: Boolean,
    default: false
  },
  builderLastPublishedAt: {
    type: Date
  },

  // ─── Brand / Corporate Swag fields ─────────────────────────────────────────
  brandProfile: {
    companyName:     { type: String, trim: true, default: '' },
    website:         { type: String, trim: true },
    emailDomain:     { type: String, trim: true, lowercase: true, default: '' },
    country:         { type: String, trim: true, default: '' },
    industry:        { type: String, trim: true, default: '' },
    headcount:       { type: Number, default: 0 },
    regions:         { type: [String], default: ['India'] },        // ['India','Taiwan','Australia','New Zealand']
    brandGuidelines: {
      primaryColor:   { type: String, default: '#000000' },
      secondaryColor: { type: String },
      logoUrl:        { type: String },
      coverImageUrl:  { type: String }
    }
  },

  // Who can access the store's ordering portal
  accessMode: {
    type: String,
    enum: ['public', 'invite_only', 'domain_restricted'],
    default: 'public'
  },

  // Subscription billing
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

  // Separate company-level wallet for credit allocation to employees
  companyWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes
storeSchema.index({ merchant: 1, isActive: 1 });
storeSchema.index({ slug: 1 });
storeSchema.index({ type: 1, isConnected: 1 });

module.exports = mongoose.model('Store', storeSchema);
