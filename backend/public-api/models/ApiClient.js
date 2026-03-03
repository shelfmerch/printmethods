/**
 * INTERNAL OAUTH FROZEN - PHASE 1
 * This is intentionally disabled.
 * Controlled by config/features.js
 * Do NOT delete. Will be reactivated in Phase 2.
 */
const mongoose = require('mongoose');

const ApiClientSchema = new mongoose.Schema({
    ownerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    redirectUris: [{
        type: String,
        required: true,
    }],
    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    clientSecretHash: {
        type: String,
        select: false, // Never returned by default
    },
    isConfidential: {
        type: Boolean,
        default: false, // true = has client secret, false = public client (PKCE only)
    },
    scopes: [{
        type: String,
    }],
    planCode: {
        type: String,
        required: true,
        default: 'free',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

ApiClientSchema.index({ ownerUserId: 1, isActive: 1 });

module.exports = mongoose.model('ApiClient', ApiClientSchema);
