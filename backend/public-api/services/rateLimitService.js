/**
 * Rate Limit Service
 * Checks and manages per-key rate limits using Mongo minute buckets.
 */
const ApiUsageLog = require('../models/ApiUsageLog');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { PLAN_LIMITS } = require('../core/constants');

/**
 * Get plan limits (with DB override support for enterprise).
 */
async function getPlanLimits(planCode) {
    try {
        const plan = await SubscriptionPlan.findOne({ code: planCode, isActive: true }).lean();
        if (plan) return plan.limits;
    } catch (_) { }

    return PLAN_LIMITS[planCode] || PLAN_LIMITS.free;
}

/**
 * Check rate limit for the current minute.
 * @returns {{ allowed: boolean, remaining: number, limit: number, resetAt: Date }}
 */
async function checkRateLimit(apiKeyId, planCode) {
    const limits = await getPlanLimits(planCode);
    const rpm = limits.rpm;

    const now = new Date();
    const bucketMinute = new Date(now);
    bucketMinute.setSeconds(0, 0);
    const resetAt = new Date(bucketMinute.getTime() + 60000);

    // Read current count
    const usage = await ApiUsageLog.findOne({
        apiKeyId,
        bucketMinute,
        routeKey: '_rate_limit',
    }).lean();

    const currentCount = usage ? usage.requestCount : 0;
    const remaining = Math.max(0, rpm - currentCount);

    return {
        allowed: currentCount < rpm,
        remaining,
        limit: rpm,
        resetAt,
        currentCount,
    };
}

module.exports = {
    getPlanLimits,
    checkRateLimit,
};
