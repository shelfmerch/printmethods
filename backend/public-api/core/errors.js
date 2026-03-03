/**
 * Public API Error Classes
 * All public API errors extend PublicApiError for consistent handling.
 */

class PublicApiError extends Error {
    constructor(code, message, statusCode = 500, details = null) {
        super(message);
        this.name = 'PublicApiError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                ...(this.details && { details: this.details }),
            },
        };
    }
}

class AuthenticationError extends PublicApiError {
    constructor(message = 'Authentication required', details = null) {
        super('AUTHENTICATION_REQUIRED', message, 401, details);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends PublicApiError {
    constructor(message = 'Insufficient permissions', details = null) {
        super('INSUFFICIENT_SCOPE', message, 403, details);
        this.name = 'AuthorizationError';
    }
}

class RateLimitError extends PublicApiError {
    constructor(retryAfter, message = 'Rate limit exceeded') {
        super('RATE_LIMIT_EXCEEDED', message, 429);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

class ValidationError extends PublicApiError {
    constructor(message = 'Validation failed', details = null) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends PublicApiError {
    constructor(resource = 'Resource', message = null) {
        super('NOT_FOUND', message || `${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends PublicApiError {
    constructor(message = 'Resource already exists', details = null) {
        super('CONFLICT', message, 409, details);
        this.name = 'ConflictError';
    }
}

module.exports = {
    PublicApiError,
    AuthenticationError,
    AuthorizationError,
    RateLimitError,
    ValidationError,
    NotFoundError,
    ConflictError,
};
