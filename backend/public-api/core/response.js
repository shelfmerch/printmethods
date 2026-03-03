/**
 * Public API Response Envelope Helpers
 * All public API responses use a consistent envelope format.
 */

/**
 * Build a success response envelope.
 * @param {*} data - The response payload
 * @param {object} meta - Additional metadata (request_id injected automatically)
 * @returns {{ data: *, meta: object }}
 */
function successResponse(data, meta = {}) {
    return {
        data,
        meta: {
            ...meta,
        },
    };
}

/**
 * Build a paginated success response envelope.
 * @param {Array} data - The list of items
 * @param {{ page: number, limit: number, total: number }} pagination
 * @param {object} meta - Additional metadata
 * @returns {{ data: Array, meta: object }}
 */
function paginatedResponse(data, pagination, meta = {}) {
    const { page, limit, total } = pagination;
    return {
        data,
        meta: {
            ...meta,
            pagination: {
                current_page: page,
                per_page: limit,
                total_count: total,
                total_pages: Math.ceil(total / limit),
            },
        },
    };
}

/**
 * Build an error response envelope.
 * @param {string} code - Machine-readable error code
 * @param {string} message - Human-readable error message
 * @param {*} details - Optional error details
 * @returns {{ error: { code: string, message: string, details?: * } }}
 */
function errorResponse(code, message, details = null) {
    return {
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
}

module.exports = {
    successResponse,
    paginatedResponse,
    errorResponse,
};
