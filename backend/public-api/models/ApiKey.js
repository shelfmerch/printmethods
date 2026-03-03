const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
    ownerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        required: true, // First 8 chars of the key for identification
    },
    keyHash: {
        type: String,
        required: true,
        unique: true,
    },
    scopes: [{
        type: String,
        required: true,
    }],
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
    },
    expiresAt: {
        type: Date, // null = never expires
    },
    revokedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

ApiKeySchema.index({ ownerUserId: 1, revokedAt: 1 });
ApiKeySchema.index({ keyHash: 1 }, { unique: true });

module.exports = mongoose.model('ApiKey', ApiKeySchema);
