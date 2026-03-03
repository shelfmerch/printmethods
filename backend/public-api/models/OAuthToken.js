/**
 * INTERNAL OAUTH FROZEN - PHASE 1
 * This is intentionally disabled.
 * Controlled by config/features.js
 * Do NOT delete. Will be reactivated in Phase 2.
 */
const mongoose = require('mongoose');

const OAuthTokenSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // Authorization code fields
    authorizationCodeHash: {
        type: String,
        index: { unique: true, sparse: true },
    },
    codeChallenge: {
        type: String,
    },
    codeChallengeMethod: {
        type: String,
        enum: ['S256'],
    },
    redirectUri: {
        type: String,
    },
    scopes: [{
        type: String,
        required: true,
    }],
    codeExpiresAt: {
        type: Date,
    },
    codeUsedAt: {
        type: Date,
    },
    // Refresh token fields
    refreshTokenHash: {
        type: String,
        index: { unique: true, sparse: true },
    },
    refreshExpiresAt: {
        type: Date,
    },
    refreshRevokedAt: {
        type: Date,
    },
    // Rotation metadata
    refreshTokenFamily: {
        type: String, // UUID to detect token reuse attacks
    },
    previousRefreshTokenHash: {
        type: String,
    },
}, {
    timestamps: true,
});

// TTL index to auto-clean expired docs after 7 days
OAuthTokenSchema.index({ codeExpiresAt: 1 }, {
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days after code expires
});

OAuthTokenSchema.index({ clientId: 1, userId: 1 });

module.exports = mongoose.model('OAuthToken', OAuthTokenSchema);
