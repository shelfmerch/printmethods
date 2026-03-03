/**
 * Public Rate Limiter Middleware
 * Mongo-backed RPM rate limiting, tier-aware.
 * Returns 429 with Retry-After and X-RateLimit-* headers.
 */
const ApiUsageLog = require('../models/ApiUsageLog');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { RateLimitError } = require('../core/errors');
const { PLAN_LIMITS } = require('../core/constants');

/**
 * Get the current UTC minute bucket as a Date object.
 */
function getCurrentMinuteBucket() {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
}

/**
 * Get plan RPM limit, with cached fallback to constants.
 */
async function getPlanRpm(planCode) {
    // Try to read from DB first for custom enterprise limits
    try {
        const plan = await SubscriptionPlan.findOne({ code: planCode, isActive: true }).lean();
        if (plan) return plan.limits.rpm;
    } catch (_) { }

    // Fallback to hardcoded limits
    return (PLAN_LIMITS[planCode] || PLAN_LIMITS.free).rpm;
}

async function publicRateLimit(req, res, next) {
    try {
        if (!req.apiAuth) {
            return next(); // No auth context — skip rate limiting (requirePublicAuth will handle)
        }

        const { apiKeyId, planCode } = req.apiAuth;
        const bucketMinute = getCurrentMinuteBucket();
        const rpm = await getPlanRpm(planCode);

        // Atomically increment the counter for this minute bucket
        const result = await ApiUsageLog.findOneAndUpdate(
            {
                apiKeyId,
                bucketMinute,
                routeKey: '_rate_limit', // Dedicated rate limit counter
            },
            {
                $inc: { requestCount: 1 },
                $setOnInsert: {
                    planCode,
                    periodMonth: `${bucketMinute.getUTCFullYear()}-${String(bucketMinute.getUTCMonth() + 1).padStart(2, '0')}`,
                },
            },
            { upsert: true, new: true }
        );

        const currentCount = result.requestCount;
        const remaining = Math.max(0, rpm - currentCount);
        const resetAt = new Date(bucketMinute.getTime() + 60000); // Next minute

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', rpm);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.floor(resetAt.getTime() / 1000));

        if (currentCount > rpm) {
            const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
            res.setHeader('Retry-After', Math.max(1, retryAfter));
            const err = new RateLimitError(retryAfter);
            return res.status(429).json(err.toJSON());
        }

        next();
    } catch (error) {
        // Rate limiter failure should not block the request
        console.error('[RateLimit] Error:', error.message);
        next();
    }
}

module.exports = { publicRateLimit };
