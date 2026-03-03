/**
 * INTERNAL OAUTH FROZEN - PHASE 1
 * This is intentionally disabled.
 * Controlled by config/features.js
 * Do NOT delete. Will be reactivated in Phase 2.
 */
/**
 * API Client Service
 * Manages OAuth2 client registration and lifecycle.
 */
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ApiClient = require('../models/ApiClient');
const { NotFoundError, ValidationError, ConflictError } = require('../core/errors');
const { ALL_SCOPES } = require('../core/constants');
const { revokeAllTokensForClient } = require('./oauthService');
const { sha256 } = require('./oauthService');

/**
 * Register a new API client.
 */
async function registerClient({ userId, name, redirectUris, planCode = 'free', scopes, isConfidential = false }) {
    if (!name || name.trim().length === 0) {
        throw new ValidationError('Client name is required.');
    }

    if (!redirectUris || redirectUris.length === 0) {
        throw new ValidationError('At least one redirect URI is required.');
    }

    // Validate scopes
    if (scopes) {
        const invalidScopes = scopes.filter(s => !ALL_SCOPES.includes(s));
        if (invalidScopes.length > 0) {
            throw new ValidationError(`Invalid scope(s): ${invalidScopes.join(', ')}`);
        }
    }

    const clientId = `sm_client_${uuidv4().replace(/-/g, '')}`;
    let clientSecret = null;
    let clientSecretHash = null;

    if (isConfidential) {
        clientSecret = `sm_secret_${crypto.randomBytes(32).toString('hex')}`;
        clientSecretHash = sha256(clientSecret);
    }

    const client = await ApiClient.create({
        ownerUserId: userId,
        name: name.trim(),
        redirectUris,
        clientId,
        clientSecretHash,
        isConfidential,
        scopes: scopes || ALL_SCOPES,
        planCode,
    });

    return {
        id: client._id,
        clientId: client.clientId,
        clientSecret, // Only returned once on creation
        name: client.name,
        redirectUris: client.redirectUris,
        isConfidential: client.isConfidential,
        scopes: client.scopes,
        planCode: client.planCode,
        createdAt: client.createdAt,
    };
}

/**
 * Get a client by clientId.
 */
async function getClient(clientId) {
    const client = await ApiClient.findOne({ clientId }).lean();
    if (!client) {
        throw new NotFoundError('API Client');
    }
    return {
        id: client._id,
        clientId: client.clientId,
        name: client.name,
        redirectUris: client.redirectUris,
        isConfidential: client.isConfidential,
        scopes: client.scopes,
        planCode: client.planCode,
        isActive: client.isActive,
        createdAt: client.createdAt,
    };
}

/**
 * List clients for a user.
 */
async function listClients(userId) {
    const clients = await ApiClient.find({ ownerUserId: userId })
        .select('-clientSecretHash')
        .sort({ createdAt: -1 })
        .lean();

    return clients.map(c => ({
        id: c._id,
        clientId: c.clientId,
        name: c.name,
        redirectUris: c.redirectUris,
        isConfidential: c.isConfidential,
        scopes: c.scopes,
        planCode: c.planCode,
        isActive: c.isActive,
        createdAt: c.createdAt,
    }));
}

/**
 * Disable a client and revoke all associated tokens.
 */
async function disableClient(clientId, userId) {
    const client = await ApiClient.findOneAndUpdate(
        { clientId, ownerUserId: userId },
        { isActive: false },
        { new: true }
    );

    if (!client) {
        throw new NotFoundError('API Client');
    }

    // Cascade: revoke all OAuth tokens for this client
    await revokeAllTokensForClient(clientId);

    return { clientId, isActive: false };
}

module.exports = {
    registerClient,
    getClient,
    listClients,
    disableClient,
};
