/**
 * Public Response Formatter Middleware
 * Wraps 2xx JSON responses in the standard { data, meta } envelope.
 */
function publicResponseFormatter(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
        // Only wrap successful responses that aren't already in envelope format
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Check if already wrapped (has 'data' key at top level)
            if (body && typeof body === 'object' && !body.data && !body.error) {
                body = {
                    data: body,
                    meta: {
                        request_id: req.requestId || null,
                    },
                };
            } else if (body && body.data !== undefined) {
                // Already wrapped — just ensure request_id is present
                if (!body.meta) body.meta = {};
                if (!body.meta.request_id) body.meta.request_id = req.requestId || null;
            }
        } else if (body && body.error) {
            // Error response — ensure request_id in meta
            if (!body.meta) body.meta = {};
            if (!body.meta.request_id) body.meta.request_id = req.requestId || null;
        }

        return originalJson(body);
    };

    next();
}

module.exports = { publicResponseFormatter };
