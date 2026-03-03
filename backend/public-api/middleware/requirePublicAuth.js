/**
 * INTERNAL OAUTH FROZEN - PHASE 1
 * This is intentionally disabled.
 * Controlled by config/features.js
 * Do NOT delete. Will be reactivated in Phase 2.
 */
/**
 * Require Public Auth Middleware
 * Resolves credential to a principal (user + scopes + plan).
 * Attaches req.apiAuth context.
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AuthenticationError } = require('../core/errors');
const { CREDENTIAL_TYPES } = require('../core/constants');
const ApiKey = require('../models/ApiKey');
const User = require('../../models/User');
const { INTERNAL_OAUTH_ENABLED } = require('../../config/features');

/**
 * Hash an API key or PAT value for lookup
 */
function hashKey(rawKey) {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}

async function resolveApiKeyAuth(rawKey) {
    const keyHash = hashKey(rawKey);
    const apiKey = await ApiKey.findOne({ keyHash, revokedAt: null });

    if (!apiKey) {
        throw new AuthenticationError('Invalid API key.');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        throw new AuthenticationError('API key has expired.');
    }

    const user = await User.findById(apiKey.ownerUserId).select('-password');
    if (!user || !user.isActive) {
        throw new AuthenticationError('API key owner account is inactive.');
    }

    ApiKey.updateOne({ _id: apiKey._id }, { lastUsedAt: new Date() }).catch(() => { });

    return {
        userId: user._id,
        user,
        apiKeyId: apiKey._id,
        scopes: apiKey.scopes,
        planCode: apiKey.planCode,
        credentialType: apiKey.type === 'personal_access_token'
            ? CREDENTIAL_TYPES.PERSONAL_ACCESS_TOKEN
            : CREDENTIAL_TYPES.API_KEY,
    };
}

async function resolvePatFromBearer(rawToken) {
    const keyHash = hashKey(rawToken);
    const apiKey = await ApiKey.findOne({
        keyHash,
        type: 'personal_access_token',
        revokedAt: null,
    });

    if (!apiKey) {
        throw new AuthenticationError('Invalid or expired access token.');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        throw new AuthenticationError('Personal access token has expired.');
    }

    const user = await User.findById(apiKey.ownerUserId).select('-password');
    if (!user || !user.isActive) {
        throw new AuthenticationError('Token owner account is inactive.');
    }

    ApiKey.updateOne({ _id: apiKey._id }, { lastUsedAt: new Date() }).catch(() => { });

    return {
        userId: user._id,
        user,
        apiKeyId: apiKey._id,
        scopes: apiKey.scopes,
        planCode: apiKey.planCode,
        credentialType: CREDENTIAL_TYPES.PERSONAL_ACCESS_TOKEN,
    };
}

async function requirePublicAuth(req, res, next) {
    try {
        if (!req.publicCredential) {
            throw new AuthenticationError('Missing authentication credentials. Provide a Bearer token or X-API-Key header.');
        }

        const { type, value } = req.publicCredential;

        if (type === CREDENTIAL_TYPES.API_KEY) {
            req.apiAuth = await resolveApiKeyAuth(value);
            return next();
        }

        if (type === CREDENTIAL_TYPES.OAUTH_ACCESS_TOKEN) {
            // Phase 1 freeze: Bearer is PAT-only when internal OAuth is disabled.
            if (!INTERNAL_OAUTH_ENABLED) {
                req.apiAuth = await resolvePatFromBearer(value);
                return next();
            }

            const secret = process.env.JWT_PUBLIC_API_SECRET || process.env.JWT_SECRET;
            try {
                const decoded = jwt.verify(value, secret, { algorithms: ['HS256'] });
                const user = await User.findById(decoded.sub).select('-password');
                if (!user || !user.isActive) {
                    throw new AuthenticationError('Token owner account is inactive.');
                }

                req.apiAuth = {
                    userId: user._id,
                    user,
                    clientId: decoded.client_id,
                    scopes: decoded.scopes || [],
                    planCode: decoded.plan || 'free',
                    credentialType: CREDENTIAL_TYPES.OAUTH_ACCESS_TOKEN,
                    tokenId: decoded.jti,
                };
                return next();
            } catch (jwtErr) {
                if (jwtErr.name === 'JsonWebTokenError' || jwtErr.name === 'TokenExpiredError') {
                    if (jwtErr.name === 'TokenExpiredError') {
                        throw new AuthenticationError('Access token has expired.');
                    }

                    req.apiAuth = await resolvePatFromBearer(value);
                    return next();
                }

                throw new AuthenticationError('Authentication failed.');
            }
        }

        throw new AuthenticationError('Unsupported credential type.');
    } catch (error) {
        if (error instanceof AuthenticationError) {
            return res.status(error.statusCode).json(error.toJSON());
        }
        console.error('[PublicAuth] Unexpected error:', error);
        return res.status(500).json({
            error: { code: 'INTERNAL_ERROR', message: 'Authentication service error.' },
        });
    }
}

module.exports = { requirePublicAuth, hashKey };
