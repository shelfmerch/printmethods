/**
 * Webhooks Routes — Public API v1
 */
const express = require('express');
const router = express.Router();
const webhookService = require('../../services/webhookService');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse } = require('../../core/response');
const { SCOPES, ALL_WEBHOOK_EVENTS } = require('../../core/constants');

/**
 * GET /webhooks
 * List webhook subscriptions.
 */
router.get('/',
    requireScopes(SCOPES.WEBHOOKS_MANAGE),
    async (req, res, next) => {
        try {
            const subscriptions = await webhookService.listSubscriptions(req.apiAuth.userId);
            res.json(successResponse(subscriptions));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /webhooks/events
 * List available webhook event types.
 */
router.get('/events',
    requireScopes(SCOPES.WEBHOOKS_MANAGE),
    async (req, res, next) => {
        try {
            res.json(successResponse({
                events: ALL_WEBHOOK_EVENTS,
            }));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /webhooks
 * Create a webhook subscription.
 */
router.post('/',
    requireScopes(SCOPES.WEBHOOKS_MANAGE),
    async (req, res, next) => {
        try {
            const { url, events } = req.body;
            const subscription = await webhookService.createSubscription(req.apiAuth.userId, { url, events });
            res.status(201).json(successResponse(subscription));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PUT /webhooks/:id
 * Update a webhook subscription.
 */
router.put('/:id',
    requireScopes(SCOPES.WEBHOOKS_MANAGE),
    async (req, res, next) => {
        try {
            const { url, events, is_active } = req.body;
            const subscription = await webhookService.updateSubscription(
                req.params.id,
                req.apiAuth.userId,
                { url, events, isActive: is_active }
            );
            res.json(successResponse(subscription));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /webhooks/:id
 * Delete a webhook subscription.
 */
router.delete('/:id',
    requireScopes(SCOPES.WEBHOOKS_MANAGE),
    async (req, res, next) => {
        try {
            const result = await webhookService.deleteSubscription(req.params.id, req.apiAuth.userId);
            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
