/**
 * Public Error Handler
 * Catches all errors in the public API pipeline and formats them into the standard error envelope.
 */
const { PublicApiError } = require('../core/errors');

function publicErrorHandler(err, req, res, _next) {
    // Already sent headers — can't respond
    if (res.headersSent) {
        return;
    }

    // Known public API error
    if (err instanceof PublicApiError) {
        const response = err.toJSON();

        // Add request_id to error meta
        if (req.requestId) {
            response.meta = { request_id: req.requestId };
        }

        // Special handling for rate limit errors
        if (err.retryAfter) {
            res.setHeader('Retry-After', err.retryAfter);
        }

        return res.status(err.statusCode).json(response);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError' && err.errors) {
        const details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(400).json({
            error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
            ...(req.requestId && { meta: { request_id: req.requestId } }),
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            error: { code: 'CONFLICT', message: 'Resource already exists.' },
            ...(req.requestId && { meta: { request_id: req.requestId } }),
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: { code: 'AUTHENTICATION_REQUIRED', message: 'Invalid or expired token.' },
            ...(req.requestId && { meta: { request_id: req.requestId } }),
        });
    }

    // Unhandled error
    console.error('[PublicAPI] Unhandled error:', err.message || err);
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error('[PublicAPI] Stack:', err.stack);
    }

    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An internal error occurred.'
                : err.message || 'An internal error occurred.',
        },
        ...(req.requestId && { meta: { request_id: req.requestId } }),
    });
}

module.exports = { publicErrorHandler };
