/**
 * API Key Service
 * Manages API keys and Personal Access Tokens (PATs).
 */
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const { NotFoundError, ValidationError } = require('../core/errors');
const { ALL_SCOPES, ALWAYS_GRANTED, DEFAULT_SCOPES } = require('../core/scopes');
const { ALL_SCOPES: LEGACY_SCOPES } = require('../core/constants');

// Allow both new-style and legacy scope strings during the transition.
const ALLOWED_SCOPES_SET = new Set([
    ...ALL_SCOPES,
    ...LEGACY_SCOPES,
]);

function filterAllowedScopes(scopes) {
    if (!Array.isArray(scopes)) return [];
    return scopes.filter((s) => ALLOWED_SCOPES_SET.has(s));
}

/**
 * Generate a random API key with a prefix for identification.
 * Format: sm_live_<random 40 chars>
 */
function generateRawKey(type = 'api_key') {
    const prefix = type === 'personal_access_token' ? 'sm_pat_' : 'sm_key_';
    const random = crypto.randomBytes(30).toString('hex'); // 60 hex chars
    return prefix + random;
}

/**
 * Hash a raw key for storage.
 */
function hashKey(rawKey) {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Create a new API key or PAT.
 * Returns the raw key (shown once).
 */
async function createApiKey({
    userId,
    name,
    scopes,
    planCode = 'free',
    type = 'api_key',
    clientId = null,
    expiresAt = null,
    storeId = null,
}) {
    // Resolve and validate scopes
    const requested = Array.isArray(scopes) && scopes.length ? scopes : null;
    let resolvedScopes = requested
        ? filterAllowedScopes(requested)
        : DEFAULT_SCOPES;

    const invalidScopes = (requested || []).filter((s) => !ALLOWED_SCOPES_SET.has(s));
    if (invalidScopes.length > 0) {
        throw new ValidationError(`Invalid scope(s): ${invalidScopes.join(', ')}`);
    }

    // Always include ALWAYS_GRANTED scopes
    resolvedScopes = [...new Set([...ALWAYS_GRANTED, ...resolvedScopes])];

    const rawKey = generateRawKey(type);
    const keyHash = hashKey(rawKey);
    const keyPrefix = rawKey.substring(0, 10); // e.g., "sm_key_ab" for visual ID

    const apiKey = await ApiKey.create({
        ownerUserId: userId,
        storeId,
        clientId,
        name,
        keyPrefix,
        keyHash,
        scopes: resolvedScopes,
        planCode,
        type,
        expiresAt,
    });

    return {
        id: apiKey._id,
        name: apiKey.name,
        key: rawKey, // Only returned once!
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        type: apiKey.type,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
    };
}

/**
 * List API keys for a user (without raw key values).
 */
async function listApiKeys(userId, { type, includeRevoked = false } = {}) {
    const filter = { ownerUserId: userId };
    if (type) filter.type = type;
    if (!includeRevoked) filter.revokedAt = null;

    const keys = await ApiKey.find(filter)
        .select('-keyHash')
        .sort({ createdAt: -1 })
        .lean();

    return keys.map(k => ({
        id: k._id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        type: k.type,
        planCode: k.planCode,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
        expiresAt: k.expiresAt,
        revokedAt: k.revokedAt,
    }));
}

/**
 * Revoke an API key.
 */
async function revokeApiKey(keyId, userId) {
    const key = await ApiKey.findOneAndUpdate(
        { _id: keyId, ownerUserId: userId, revokedAt: null },
        { revokedAt: new Date() },
        { new: true }
    );

    if (!key) {
        throw new NotFoundError('API key');
    }

    return { id: key._id, revokedAt: key.revokedAt };
}

/**
 * Revoke all keys for a user (used when disabling a client).
 */
async function revokeAllKeysForUser(userId) {
    await ApiKey.updateMany(
        { ownerUserId: userId, revokedAt: null },
        { revokedAt: new Date() }
    );
}

/**
 * Validate a raw API key and return the key document.
 */
async function validateApiKey(rawKey) {
    const keyHash = hashKey(rawKey);
    const apiKey = await ApiKey.findOne({ keyHash, revokedAt: null });

    if (!apiKey) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    return apiKey;
}

module.exports = {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    revokeAllKeysForUser,
    validateApiKey,
    hashKey,
};
