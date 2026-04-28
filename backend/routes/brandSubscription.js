const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const { protect } = require('../middleware/auth');
const { PLAN_LIMITS, getPlanLimits, normalizePlanId, isKnownPlanId } = require('../utils/planLimits');

// ── Access helper ──────────────────────────────────────────────────────────────
const BRAND_ROLES = ['Owner', 'Superadmin', 'BrandAdmin'];

const assertBrandAccess = async (req, storeId) => {
    const store = await Store.findById(storeId).lean();
    if (!store) throw Object.assign(new Error('Store not found'), { status: 404 });
    const isMerchant = store.merchant?.toString() === req.user.id;
    const isPrivileged = BRAND_ROLES.includes(req.user.role);
    if (!isMerchant && !isPrivileged) {
        throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    return store;
};

// ── Plans definition (single source of truth) ─────────────────────────────────
const PLANS = PLAN_LIMITS;

// ── GET /api/brand-subscription/:brandId ─────────────────────────────────────
// Returns current plan details + subscription status
router.get('/:brandId', protect, async (req, res) => {
    try {
        const store = await assertBrandAccess(req, req.params.brandId);
        const planId = normalizePlanId(store.subscriptionPlan);
        const plan = getPlanLimits(planId);

        return res.json({
            success: true,
            data: {
                brandId: store._id,
                planId,
                plan,
                status: store.subscriptionStatus || 'trial',
                expiryDate: store.subscriptionExpiry || null,
                isExpired: store.subscriptionExpiry
                    ? new Date(store.subscriptionExpiry) < new Date()
                    : false,
            },
        });
    } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/brand-subscription/:brandId ───────────────────────────────────
// Superadmin / internal use: manually update a brand's subscription plan.
// In production, Razorpay webhook will call this via a verified endpoint instead.
router.patch('/:brandId', protect, async (req, res) => {
    if (!['Superadmin', 'Owner'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Super admin access required' });
    }

    const { plan, status, expiryDate } = req.body;

    if (plan && !isKnownPlanId(plan)) {
        return res.status(400).json({ success: false, message: `Invalid plan: ${plan}` });
    }

    try {
        const updates = {};
        if (plan) updates.subscriptionPlan = normalizePlanId(plan);
        if (status) updates.subscriptionStatus = status;
        if (expiryDate) updates.subscriptionExpiry = new Date(expiryDate);

        const store = await Store.findByIdAndUpdate(
            req.params.brandId,
            { $set: updates },
            { new: true, select: 'subscriptionPlan subscriptionStatus subscriptionExpiry storeName' }
        );

        if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

        return res.json({
            success: true,
            message: 'Subscription updated',
            data: {
                brandId: store._id,
                storeName: store.storeName,
                plan: store.subscriptionPlan,
                status: store.subscriptionStatus,
                expiryDate: store.subscriptionExpiry,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/brand-subscription/:brandId/initiate ───────────────────────────
// Future: Create a Razorpay subscription and return checkout URL / subscription ID.
// Currently returns a "coming soon" contact response.
router.post('/:brandId/initiate', protect, async (req, res) => {
    try {
        await assertBrandAccess(req, req.params.brandId);
        const { plan } = req.body;

        const normalizedPlan = normalizePlanId(plan);
        if (!plan || !isKnownPlanId(plan)) {
            return res.status(400).json({ success: false, message: `Invalid plan: ${plan}` });
        }

        if (normalizedPlan === 'enterprise') {
            return res.json({
                success: true,
                action: 'contact',
                message: 'Please contact hello@shelfmerch.in for Enterprise pricing.',
            });
        }

        // TODO: Implement Razorpay Subscription creation when billing goes live
        // const razorpay = new Razorpay({ key_id: ..., key_secret: ... });
        // const sub = await razorpay.subscriptions.create({ plan_id: ..., total_count: 12, ... });
        // return res.json({ success: true, action: 'razorpay', subscriptionId: sub.id, ... });

        return res.json({
            success: true,
            action: 'contact',
            message: 'Subscription payments are coming soon. Contact hello@shelfmerch.in to activate your plan.',
            plan: PLANS[normalizedPlan],
        });
    } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message });
    }
});

module.exports = router;
