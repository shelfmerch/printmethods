/**
 * Shops Routes — Public API v1
 */
const express = require('express');
const router = express.Router();
const shopsFacade = require('../../services/shopsFacade');
const productsFacade = require('../../services/productsFacade');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse, paginatedResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');

/**
 * GET /shops
 * List shops for the authenticated user.
 */
router.get('/',
    requireScopes(SCOPES.SHOPS_READ),
    async (req, res, next) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const result = await shopsFacade.listShops(req.apiAuth.userId, {
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
 * GET /shops/:shopId
 * Get a single shop.
 */
router.get('/:shopId',
    requireScopes(SCOPES.SHOPS_READ),
    async (req, res, next) => {
        try {
            const shop = await shopsFacade.getShop(req.params.shopId, req.apiAuth.userId);
            res.json(successResponse(shop));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /shops/:shopId/connection
 * Disconnect a shop from its external platform.
 */
router.delete('/:shopId/connection',
    requireScopes(SCOPES.SHOPS_READ), // Need at minimum read access to manage connection
    async (req, res, next) => {
        try {
            const result = await shopsFacade.disconnectShop(req.params.shopId, req.apiAuth.userId);
            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /shops/:shopId/products/:productId/public
 * Customer-safe view of a published product.
 */
router.get('/:shopId/products/:productId/public',
    requireScopes(SCOPES.SHOPS_READ),
    async (req, res, next) => {
        try {
            const data = await productsFacade.getPublicProduct(
                req.params.shopId,
                req.params.productId,
                req.apiAuth.userId
            );
            res.json(successResponse(data));
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
