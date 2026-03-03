/**
 * Usage Metering Middleware
 * Post-response hook: records per-key, per-route, per-month usage.
 */
const ApiUsageLog = require('../models/ApiUsageLog');

function usageMeter(req, res, next) {
    // Hook into response finish to record usage
    const originalEnd = res.end;

    res.end = function (...args) {
        // Restore original
        res.end = originalEnd;
        res.end(...args);

        // Fire and forget usage recording
        if (req.apiAuth && req.apiAuth.apiKeyId) {
            const now = new Date();
            const bucketMinute = new Date(now);
            bucketMinute.setSeconds(0, 0);

            const statusCode = res.statusCode;
            let statusClass = '2xx';
            if (statusCode >= 300 && statusCode < 400) statusClass = '3xx';
            else if (statusCode >= 400 && statusCode < 500) statusClass = '4xx';
            else if (statusCode >= 500) statusClass = '5xx';

            const routeKey = `${req.method} ${req.route ? req.baseUrl + req.route.path : req.originalUrl.split('?')[0]}`;
            const periodMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

            ApiUsageLog.findOneAndUpdate(
                {
                    apiKeyId: req.apiAuth.apiKeyId,
                    bucketMinute,
                    routeKey,
                    statusClass,
                },
                {
                    $inc: { requestCount: 1 },
                    $setOnInsert: {
                        planCode: req.apiAuth.planCode,
                        periodMonth,
                    },
                },
                { upsert: true }
            ).catch(err => {
                console.error('[UsageMeter] Error recording usage:', err.message);
            });
        }
    };

    next();
}

module.exports = { usageMeter };
