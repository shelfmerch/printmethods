/**
 * INTERNAL OAUTH FROZEN - PHASE 1
 * This is intentionally disabled.
 * Controlled by config/features.js
 * Do NOT delete. Will be reactivated in Phase 2.
 */
/**
 * Auth Routes - Public API v1
 * OAuth2, Personal Access Tokens, API Keys, Scope introspection.
 */
const express = require('express');
const router = express.Router();
const apiKeyService = require('../../services/apiKeyService');
const { requirePublicAuth } = require('../../middleware/requirePublicAuth');
const { parsePublicCredential } = require('../../middleware/parsePublicCredential');
const { auditHook } = require('../../middleware/auditHook');
const { successResponse } = require('../../core/response');
const { ValidationError } = require('../../core/errors');
const { ALL_SCOPES, DEFAULT_SCOPES, ALWAYS_GRANTED } = require('../../core/scopes');
const Store = require('../../../models/Store');
const { PLAN_LIMITS } = require('../../core/constants');
const { INTERNAL_OAUTH_ENABLED } = require('../../../config/features');

function oauthFrozenResponse(req, res) {
    return res.status(403).json({
        error: 'Internal OAuth temporarily disabled',
    });
}

function registerOAuthRoutes(targetRouter) {
    const oauthService = require('../../services/oauthService');
    const apiClientService = require('../../services/apiClientService');

    targetRouter.get('/oauth/authorize', async (req, res, next) => {
        try {
            const { client_id, redirect_uri, response_type, scope, state, code_challenge } = req.query;

            if (response_type !== 'code') {
                throw new ValidationError('response_type must be "code".');
            }

            if (!client_id) {
                throw new ValidationError('client_id is required.');
            }

            const client = await apiClientService.getClient(client_id);

            res.json(successResponse({
                authorization_endpoint: true,
                client_id,
                client_name: client.name,
                redirect_uri: redirect_uri || client.redirectUris[0],
                scopes_requested: scope ? scope.split(' ') : ALL_SCOPES,
                state,
                code_challenge_required: !client.isConfidential || !!code_challenge,
                message: 'User consent required. In production, this redirects to a consent UI.',
            }));
        } catch (error) {
            next(error);
        }
    });

    targetRouter.post('/oauth/authorize', async (req, res, next) => {
        try {
            const { client_id, redirect_uri, scope, code_challenge, code_challenge_method, user_id } = req.body;

            if (!client_id || !user_id) {
                throw new ValidationError('client_id and user_id are required.');
            }

            const scopes = scope ? (typeof scope === 'string' ? scope.split(' ') : scope) : ALL_SCOPES;

            const code = await oauthService.generateAuthorizationCode({
                clientId: client_id,
                userId: user_id,
                scopes,
                codeChallenge: code_challenge,
                codeChallengeMethod: code_challenge_method || 'S256',
                redirectUri: redirect_uri,
            });

            const responseData = { authorization_code: code };
            if (redirect_uri) {
                const redirectUrl = new URL(redirect_uri);
                redirectUrl.searchParams.set('code', code);
                if (req.body.state) redirectUrl.searchParams.set('state', req.body.state);
                responseData.redirect_url = redirectUrl.toString();
            }

            res.status(201).json(successResponse(responseData));
        } catch (error) {
            next(error);
        }
    });

    targetRouter.post('/oauth/token', auditHook('oauth.token_exchange'), async (req, res, next) => {
        try {
            const { grant_type, code, code_verifier, client_id, client_secret, redirect_uri, refresh_token } = req.body;

            if (grant_type === 'authorization_code') {
                if (!code || !client_id) {
                    throw new ValidationError('code and client_id are required for authorization_code grant.');
                }

                const tokens = await oauthService.exchangeAuthorizationCode({
                    code,
                    codeVerifier: code_verifier,
                    clientId: client_id,
                    clientSecret: client_secret,
                    redirectUri: redirect_uri,
                });

                return res.json(successResponse(tokens));
            }

            if (grant_type === 'refresh_token') {
                if (!refresh_token || !client_id) {
                    throw new ValidationError('refresh_token and client_id are required for refresh_token grant.');
                }

                const tokens = await oauthService.refreshAccessToken({
                    refreshToken: refresh_token,
                    clientId: client_id,
                    clientSecret: client_secret,
                });

                return res.json(successResponse(tokens));
            }

            throw new ValidationError('Unsupported grant_type. Supported: authorization_code, refresh_token.');
        } catch (error) {
            next(error);
        }
    });

    targetRouter.post('/oauth/revoke', async (req, res, next) => {
        try {
            const { token } = req.body;
            if (!token) {
                throw new ValidationError('token is required.');
            }

            await oauthService.revokeRefreshToken(token);
            res.json(successResponse({ revoked: true }));
        } catch (error) {
            next(error);
        }
    });
}

function registerOAuthClientRoutes(targetRouter) {
    const apiClientService = require('../../services/apiClientService');

    targetRouter.post('/clients',
        parsePublicCredential,
        requirePublicAuth,
        auditHook('client.registered'),
        async (req, res, next) => {
            try {
                const { name, redirect_uris, is_confidential, scopes } = req.body;
                const result = await apiClientService.registerClient({
                    userId: req.apiAuth.userId,
                    name,
                    redirectUris: redirect_uris,
                    isConfidential: is_confidential,
                    scopes,
                    planCode: req.apiAuth.planCode,
                });
                res.status(201).json(successResponse(result));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.get('/clients',
        parsePublicCredential,
        requirePublicAuth,
        async (req, res, next) => {
            try {
                const clients = await apiClientService.listClients(req.apiAuth.userId);
                res.json(successResponse(clients));
            } catch (error) {
                next(error);
            }
        }
    );
}

function registerPatAndApiKeyRoutes(targetRouter) {
    targetRouter.post('/tokens/personal',
        parsePublicCredential,
        requirePublicAuth,
        auditHook('pat.created'),
        async (req, res, next) => {
            try {
                const { name, scopes, expires_in_days } = req.body;

                if (!name) {
                    throw new ValidationError('name is required.');
                }

                const expiresAt = expires_in_days
                    ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
                    : null;

                // Scope resolution + ALWAYS_GRANTED
                let requestedScopes = Array.isArray(scopes) ? scopes : undefined;
                const result = await apiKeyService.createApiKey({
                    userId: req.apiAuth.userId,
                    name,
                    scopes: requestedScopes,
                    planCode: req.apiAuth.planCode,
                    type: 'personal_access_token',
                    expiresAt,
                });

                res.status(201).json(successResponse(result, {
                    warning: 'This token will not be shown again. Copy it now.',
                }));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.get('/tokens/personal',
        parsePublicCredential,
        requirePublicAuth,
        async (req, res, next) => {
            try {
                const keys = await apiKeyService.listApiKeys(req.apiAuth.userId, {
                    type: 'personal_access_token',
                });
                res.json(successResponse(keys));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.delete('/tokens/personal/:id',
        parsePublicCredential,
        requirePublicAuth,
        auditHook('pat.revoked'),
        async (req, res, next) => {
            try {
                const result = await apiKeyService.revokeApiKey(req.params.id, req.apiAuth.userId);
                res.json(successResponse(result));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.post('/keys',
        parsePublicCredential,
        requirePublicAuth,
        auditHook('apikey.created'),
        async (req, res, next) => {
            try {
                const { name, scopes, store_id } = req.body;

                if (!name) {
                    throw new ValidationError('name is required.');
                }

                if (!store_id) {
                    return res.status(422).json({
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'store_id is required. API keys must be scoped to a store.',
                            details: { field: 'store_id' },
                        },
                    });
                }

                // Verify user owns this store
                const store = await Store.findOne({
                    _id: store_id,
                    merchant: req.apiAuth.userId,
                    isActive: true,
                }).lean();

                if (!store) {
                    return res.status(403).json({
                        error: {
                            code: 'STORE_ACCESS_DENIED',
                            message: 'Store not found or access denied.',
                        },
                    });
                }

                const result = await apiKeyService.createApiKey({
                    userId: req.apiAuth.userId,
                    name,
                    scopes,
                    planCode: req.apiAuth.planCode,
                    type: 'api_key',
                    storeId: store._id,
                });

                const payload = {
                    id: result.id,
                    name: result.name,
                    key: result.key,
                    key_prefix: result.keyPrefix,
                    store_id: store._id,
                    store_name: store.name,
                    scopes: result.scopes,
                    created_at: result.createdAt,
                };

                res.status(201).json(successResponse(payload, {
                    warning: 'This is the only time your API key will be shown. Copy it now and store it securely.',
                }));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.get('/keys',
        parsePublicCredential,
        requirePublicAuth,
        async (req, res, next) => {
            try {
                const keys = await apiKeyService.listApiKeys(req.apiAuth.userId, {
                    type: 'api_key',
                });
                res.json(successResponse(keys));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.delete('/keys/:id',
        parsePublicCredential,
        requirePublicAuth,
        auditHook('apikey.revoked'),
        async (req, res, next) => {
            try {
                const result = await apiKeyService.revokeApiKey(req.params.id, req.apiAuth.userId);
                res.json(successResponse(result));
            } catch (error) {
                next(error);
            }
        }
    );

    targetRouter.get('/me/scopes',
        parsePublicCredential,
        requirePublicAuth,
        async (req, res, next) => {
            try {
                res.json(successResponse({
                    scopes: req.apiAuth.scopes,
                    credential_type: req.apiAuth.credentialType,
                    plan: req.apiAuth.planCode,
                    // Extended but backwards compatible:
                    store_id: null,
                    store_name: null,
                }));
            } catch (error) {
                next(error);
            }
        }
    );

    // New richer identity endpoint
    targetRouter.get('/me',
        parsePublicCredential,
        requirePublicAuth,
        async (req, res, next) => {
            try {
                const { userId, scopes, credentialType, planCode } = req.apiAuth;

                const stores = await Store.find({ merchant: userId, isActive: true })
                    .select('name slug type isConnected settings.currency domain')
                    .lean();

                const rpm = (PLAN_LIMITS[planCode] || PLAN_LIMITS.free).rpm;

                res.json(successResponse({
                    credential_type: credentialType,
                    user_id: userId,
                    scopes,
                    active_store: null, // v1: store context is per-request; future: derive from key storeId
                    stores: stores.map(s => ({
                        id: s._id,
                        name: s.name,
                        slug: s.slug,
                        source: s.type,
                        status: s.isActive ? 'active' : 'inactive',
                        plan: planCode,
                    })),
                    rate_limit_rpm: rpm,
                }));
            } catch (error) {
                next(error);
            }
        }
    );
}

if (INTERNAL_OAUTH_ENABLED) {
    registerOAuthRoutes(router);
    registerOAuthClientRoutes(router);
} else {
    router.all('/oauth/callback', oauthFrozenResponse);
    router.use('/oauth', oauthFrozenResponse);
    router.use('/clients', oauthFrozenResponse);
}

registerPatAndApiKeyRoutes(router);

module.exports = router;
