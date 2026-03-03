/**
 * Require Scopes Middleware
 * Factory function that returns middleware enforcing required scopes.
 */
const { AuthorizationError } = require('../core/errors');

/**
 * @param {...string} requiredScopes - One or more scopes required for this route
 * @returns {Function} Express middleware
 */
function requireScopes(...requiredScopes) {
    return (req, res, next) => {
        if (!req.apiAuth) {
            const err = new AuthorizationError('Authentication context not found.');
            return res.status(err.statusCode).json(err.toJSON());
        }

        const userScopes = req.apiAuth.scopes || [];
        const missing = requiredScopes.filter(s => !userScopes.includes(s));

        if (missing.length > 0) {
            const err = new AuthorizationError(
                `Missing required scope(s): ${missing.join(', ')}`,
                { required: requiredScopes, granted: userScopes, missing }
            );
            return res.status(err.statusCode).json(err.toJSON());
        }

        next();
    };
}

module.exports = { requireScopes };
