/**
 * Orders Routes — Public API v1
 * v1 uses StoreOrder only.
 */
const express = require('express');
const router = express.Router();
const ordersFacade = require('../../services/ordersFacade');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse, paginatedResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');

/**
 * GET /orders
 * List orders with filtering.
 */
router.get('/',
    requireScopes(SCOPES.ORDERS_READ),
    async (req, res, next) => {
        try {
            const { status, from, to, page = 1, limit = 20, store_id } = req.query;
            const result = await ordersFacade.listOrders(req.apiAuth.userId, {
                status,
                from,
                to,
                storeId: store_id,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
            });

            res.json(paginatedResponse(result.items, {
                page: result.page,
                limit: result.limit,
                total: result.total,
            }));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /orders/:id
 * Get a single order.
 */
router.get('/:id',
    requireScopes(SCOPES.ORDERS_READ),
    async (req, res, next) => {
        try {
            const order = await ordersFacade.getOrder(req.params.id, req.apiAuth.userId);
            res.json(successResponse(order));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /orders
 * Create an order.
 */
router.post('/',
    requireScopes(SCOPES.ORDERS_WRITE),
    async (req, res, next) => {
        try {
            const order = await ordersFacade.createOrder(req.apiAuth.userId, req.body);
            res.status(201).json(successResponse(order));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /orders/:id/cancel
 * Cancel an order.
 */
router.post('/:id/cancel',
    requireScopes(SCOPES.ORDERS_WRITE),
    async (req, res, next) => {
        try {
            const order = await ordersFacade.cancelOrder(req.params.id, req.apiAuth.userId);
            res.json(successResponse(order));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /orders/:id/fulfillment
 * Get fulfillment details for an order.
 */
router.get('/:id/fulfillment',
    requireScopes(SCOPES.ORDERS_READ),
    async (req, res, next) => {
        try {
            const fulfillment = await ordersFacade.getOrderFulfillment(req.params.id, req.apiAuth.userId);
            res.json(successResponse(fulfillment));
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
