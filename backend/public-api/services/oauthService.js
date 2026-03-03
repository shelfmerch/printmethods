/**
 * INTERNAL OAUTH FROZEN - PHASE 1
 * This is intentionally disabled.
 * Controlled by config/features.js
 * Do NOT delete. Will be reactivated in Phase 2.
 */
/**
 * OAuth2 Service
 * Authorization Code + PKCE flow, JWT access tokens, rotating refresh tokens.
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const OAuthToken = require('../models/OAuthToken');
const ApiClient = require('../models/ApiClient');
const { AuthenticationError, ValidationError } = require('../core/errors');
const { OAUTH } = require('../core/constants');

/**
 * Hash a value using SHA-256.
 */
function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Base64url encode (for PKCE code_verifier comparison).
 */
function base64url(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Verify PKCE S256 challenge.
 */
function verifyPKCE(codeVerifier, codeChallenge) {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const challenge = base64url(hash);
    return challenge === codeChallenge;
}

/**
 * Generate an authorization code and store it.
 */
async function generateAuthorizationCode({ clientId, userId, scopes, codeChallenge, codeChallengeMethod, redirectUri }) {
    if (codeChallengeMethod && codeChallengeMethod !== 'S256') {
        throw new ValidationError('Only S256 code_challenge_method is supported.');
    }

    const client = await ApiClient.findOne({ clientId, isActive: true });
    if (!client) {
        throw new AuthenticationError('Invalid client_id.');
    }

    if (redirectUri && !client.redirectUris.includes(redirectUri)) {
        throw new ValidationError('Invalid redirect_uri.');
    }

    const code = crypto.randomBytes(32).toString('hex');
    const codeHash = sha256(code);

    await OAuthToken.create({
        clientId,
        userId,
        authorizationCodeHash: codeHash,
        codeChallenge,
        codeChallengeMethod: codeChallengeMethod || 'S256',
        redirectUri,
        scopes,
        codeExpiresAt: new Date(Date.now() + OAUTH.AUTH_CODE_TTL_SECONDS * 1000),
    });

    return code;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
async function exchangeAuthorizationCode({ code, codeVerifier, clientId, clientSecret, redirectUri }) {
    const codeHash = sha256(code);

    const tokenDoc = await OAuthToken.findOne({
        authorizationCodeHash: codeHash,
        clientId,
        codeUsedAt: null,
    });

    if (!tokenDoc) {
        throw new AuthenticationError('Invalid or expired authorization code.');
    }

    // Check expiry
    if (tokenDoc.codeExpiresAt < new Date()) {
        throw new AuthenticationError('Authorization code has expired.');
    }

    // Check redirect_uri matches
    if (tokenDoc.redirectUri && redirectUri !== tokenDoc.redirectUri) {
        throw new ValidationError('redirect_uri mismatch.');
    }

    // Validate client
    const client = await ApiClient.findOne({ clientId, isActive: true }).select('+clientSecretHash');
    if (!client) {
        throw new AuthenticationError('Invalid client_id.');
    }

    // For confidential clients, verify client secret
    if (client.isConfidential) {
        if (!clientSecret) {
            throw new AuthenticationError('Client secret required for confidential clients.');
        }
        const secretHash = sha256(clientSecret);
        if (secretHash !== client.clientSecretHash) {
            throw new AuthenticationError('Invalid client secret.');
        }
    }

    // Verify PKCE
    if (tokenDoc.codeChallenge) {
        if (!codeVerifier) {
            throw new ValidationError('code_verifier is required.');
        }
        if (!verifyPKCE(codeVerifier, tokenDoc.codeChallenge)) {
            throw new AuthenticationError('PKCE verification failed.');
        }
    }

    // Mark code as used
    tokenDoc.codeUsedAt = new Date();

    // Generate tokens
    const accessToken = generateAccessToken({
        sub: tokenDoc.userId.toString(),
        client_id: clientId,
        scopes: tokenDoc.scopes,
        plan: client.planCode,
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = sha256(refreshToken);
    const refreshFamily = uuidv4();

    tokenDoc.refreshTokenHash = refreshTokenHash;
    tokenDoc.refreshExpiresAt = new Date(Date.now() + OAUTH.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    tokenDoc.refreshTokenFamily = refreshFamily;
    await tokenDoc.save();

    return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: OAUTH.ACCESS_TOKEN_TTL_SECONDS,
        refresh_token: refreshToken,
        scope: tokenDoc.scopes.join(' '),
    };
}

/**
 * Refresh an access token using a refresh token.
 */
async function refreshAccessToken({ refreshToken, clientId, clientSecret }) {
    const refreshHash = sha256(refreshToken);

    const tokenDoc = await OAuthToken.findOne({
        refreshTokenHash: refreshHash,
        clientId,
        refreshRevokedAt: null,
    });

    if (!tokenDoc) {
        throw new AuthenticationError('Invalid refresh token.');
    }

    if (tokenDoc.refreshExpiresAt < new Date()) {
        throw new AuthenticationError('Refresh token has expired.');
    }

    // Validate client
    const client = await ApiClient.findOne({ clientId, isActive: true }).select('+clientSecretHash');
    if (!client) {
        throw new AuthenticationError('Invalid client.');
    }

    // For confidential clients, verify client secret
    if (client.isConfidential && clientSecret) {
        const secretHash = sha256(clientSecret);
        if (secretHash !== client.clientSecretHash) {
            throw new AuthenticationError('Invalid client secret.');
        }
    }

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(48).toString('hex');
    const newRefreshHash = sha256(newRefreshToken);

    tokenDoc.previousRefreshTokenHash = tokenDoc.refreshTokenHash;
    tokenDoc.refreshTokenHash = newRefreshHash;
    tokenDoc.refreshExpiresAt = new Date(Date.now() + OAUTH.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await tokenDoc.save();

    const accessToken = generateAccessToken({
        sub: tokenDoc.userId.toString(),
        client_id: clientId,
        scopes: tokenDoc.scopes,
        plan: client.planCode,
    });

    return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: OAUTH.ACCESS_TOKEN_TTL_SECONDS,
        refresh_token: newRefreshToken,
        scope: tokenDoc.scopes.join(' '),
    };
}

/**
 * Revoke a refresh token.
 */
async function revokeRefreshToken(refreshToken) {
    const refreshHash = sha256(refreshToken);
    const result = await OAuthToken.findOneAndUpdate(
        { refreshTokenHash: refreshHash },
        { refreshRevokedAt: new Date() }
    );
    return !!result;
}

/**
 * Revoke all tokens for a client.
 */
async function revokeAllTokensForClient(clientId) {
    await OAuthToken.updateMany(
        { clientId, refreshRevokedAt: null },
        { refreshRevokedAt: new Date() }
    );
}

/**
 * Generate a JWT access token.
 */
function generateAccessToken({ sub, client_id, scopes, plan }) {
    const secret = process.env.JWT_PUBLIC_API_SECRET || process.env.JWT_SECRET;
    return jwt.sign(
        {
            sub,
            client_id,
            scopes,
            plan,
            jti: uuidv4(),
            iss: process.env.OAUTH_ISSUER || 'shelfmerch',
        },
        secret,
        {
            algorithm: 'HS256',
            expiresIn: OAUTH.ACCESS_TOKEN_TTL,
        }
    );
}

module.exports = {
    generateAuthorizationCode,
    exchangeAuthorizationCode,
    refreshAccessToken,
    revokeRefreshToken,
    revokeAllTokensForClient,
    generateAccessToken,
    sha256,
    verifyPKCE,
};
