/**
 * Admin API Usage Routes
 * Internal admin endpoints for API usage monitoring.
 * Mounted under existing internal auth (superadmin only).
 */
const express = require('express');
const router = express.Router();
const { getUsageSummary, getAllUsageSummary } = require('../../services/usageService');
const ApiKey = require('../../models/ApiKey');

/**
 * GET /api/admin/api-usage/summary
 * Top-level usage summary across all API keys.
 */
router.get('/summary', async (req, res, next) => {
    try {
        const now = new Date();
        const periodMonth = req.query.period || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const summary = await getAllUsageSummary(periodMonth, { limit, skip });

        res.json({
            success: true,
            data: {
                period: periodMonth,
                keys: summary,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/api-usage/keys/:id
 * Per-key usage breakdown.
 */
router.get('/keys/:id', async (req, res, next) => {
    try {
        const now = new Date();
        const periodMonth = req.query.period || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

        // Verify key exists
        const key = await ApiKey.findById(req.params.id).select('name keyPrefix ownerUserId planCode type').lean();
        if (!key) {
            return res.status(404).json({ success: false, message: 'API key not found' });
        }

        const usage = await getUsageSummary(key._id, periodMonth);

        res.json({
            success: true,
            data: {
                key: {
                    id: key._id,
                    name: key.name,
                    keyPrefix: key.keyPrefix,
                    planCode: key.planCode,
                    type: key.type,
                },
                usage,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
