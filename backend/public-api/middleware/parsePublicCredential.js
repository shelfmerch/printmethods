/**
 * Parse Public Credential Middleware
 * Extracts credentials from Authorization header (Bearer JWT/PAT) or X-API-Key header.
 * Attaches raw credential info to req.publicCredential.
 */
const { CREDENTIAL_TYPES } = require('../core/constants');

function parsePublicCredential(req, res, next) {
    req.publicCredential = null;

    // Check Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        if (token) {
            req.publicCredential = {
                type: CREDENTIAL_TYPES.OAUTH_ACCESS_TOKEN, // Could be OAuth JWT or PAT — resolved later
                value: token,
            };
            return next();
        }
    }

    // Check X-API-Key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        req.publicCredential = {
            type: CREDENTIAL_TYPES.API_KEY,
            value: apiKey.trim(),
        };
        return next();
    }

    // No credential found — continue (requirePublicAuth will reject if needed)
    next();
}

module.exports = { parsePublicCredential };
