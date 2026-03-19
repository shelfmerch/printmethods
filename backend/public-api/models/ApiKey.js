const mongoose = require('mongoose');
const { DEFAULT_SCOPES, ALL_SCOPES } = require('../core/scopes');
const { ALL_SCOPES: LEGACY_SCOPES } = require('../core/constants');

const ALLOWED_SCOPES_SET = new Set([
  ...ALL_SCOPES,
  ...LEGACY_SCOPES,
]);

const ApiKeySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Store-scoped identity: required for API keys, optional for PATs
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required() {
        return this.type === 'api_key';
      },
      index: true,
    },
    clientId: {
      type: String,
      ref: 'ApiClient',
      sparse: true, // Optional — PATs may not have a client
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    keyPrefix: {
      type: String,
      required: true, // First 10 chars of the key for identification
    },
    keyHash: {
      type: String,
      required: true,
      unique: true, // SHA-256 hash — never store raw key
    },
    scopes: {
      type: [String],
      default: DEFAULT_SCOPES,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.every((s) => ALLOWED_SCOPES_SET.has(s)),
        message: 'Invalid scope value',
      },
    },
    planCode: {
      type: String,
      required: true,
      default: 'free',
    },
    type: {
      type: String,
      enum: ['api_key', 'personal_access_token'],
      default: 'api_key',
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date, // null = never expires
    },
    revokedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ApiKeySchema.index({ ownerUserId: 1, revokedAt: 1 });
ApiKeySchema.index({ keyHash: 1 }, { unique: true });

module.exports = mongoose.model('ApiKey', ApiKeySchema);

