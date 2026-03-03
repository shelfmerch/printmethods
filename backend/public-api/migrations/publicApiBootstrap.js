/**
 * Public API Bootstrap Migration
 * Runs on startup to ensure indexes and seed subscription plans.
 */
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { PLAN_LIMITS } = require('../core/constants');

const SEED_PLANS = [
    { code: 'free', name: 'Free', limits: PLAN_LIMITS.free },
    { code: 'starter', name: 'Starter', limits: PLAN_LIMITS.starter },
    { code: 'business', name: 'Business', limits: PLAN_LIMITS.business },
    { code: 'enterprise', name: 'Enterprise', limits: PLAN_LIMITS.enterprise },
];

const runPublicApiBootstrap = async () => {
    try {
        console.log('[PublicAPI Migration] Starting bootstrap...');

        // Seed subscription plans (upsert)
        for (const plan of SEED_PLANS) {
            await SubscriptionPlan.findOneAndUpdate(
                { code: plan.code },
                { $setOnInsert: plan },
                { upsert: true, new: true }
            );
        }
        console.log('[PublicAPI Migration] ✅ Subscription plans seeded.');

        console.log('[PublicAPI Migration] ✅ Bootstrap completed.');
    } catch (error) {
        console.error('[PublicAPI Migration] ❌ Bootstrap error:', error.message);
    }
};

module.exports = { runPublicApiBootstrap };
