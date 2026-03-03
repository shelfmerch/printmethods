/**
 * Enforce HTTPS Middleware
 * Rejects non-TLS requests in production for public API routes.
 */
function enforceHttps(req, res, next) {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).json({
            error: {
                code: 'HTTPS_REQUIRED',
                message: 'HTTPS is required for public API access.',
            },
        });
    }
    next();
}

module.exports = { enforceHttps };
