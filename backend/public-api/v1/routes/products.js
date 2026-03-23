/**
 * Products Routes — Public API v1
 *
 * NOTE: Product CREATION must use POST /shops/:shopId/products.
 * This router handles cross-shop reads and product lifecycle actions.
 */
const express = require('express');
const router = express.Router();
const productsFacade = require('../../services/productsFacade');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse, paginatedResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');

/**
 * GET /products
 * List products across all of the user's shops.
 */
router.get('/',
    requireScopes(SCOPES.PRODUCTS_READ),
    async (req, res, next) => {
        try {
            const { store_id, shop_id, status, page = 1, limit = 20 } = req.query;
            const result = await productsFacade.listProducts(req.apiAuth.userId, {
                storeId: shop_id || store_id,
                status,
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
 * GET /products/:id
 * Get a single product.
 */
router.get('/:id',
    requireScopes(SCOPES.PRODUCTS_READ),
    async (req, res, next) => {
        try {
            const product = await productsFacade.getProduct(req.params.id, req.apiAuth.userId);
            res.json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /products
 * DEPRECATED: Product creation requires a shop.
 * Use POST /shops/:shopId/products instead.
 */
router.post('/',
    requireScopes(SCOPES.PRODUCTS_WRITE),
    async (req, res) => {
        return res.status(422).json({
            error: {
                code: 'SHOP_REQUIRED',
                message: 'Create a shop before creating products. Use POST /shops/:shopId/products.',
                hint: 'First call GET /shops to list or POST /shops to create a shop, then use POST /shops/{shopId}/products.',
            },
        });
    }
);

/**
 * PUT /products/:id
 * Update a product.
 */
router.put('/:id',
    requireScopes(SCOPES.PRODUCTS_WRITE),
    async (req, res, next) => {
        try {
            const product = await productsFacade.updateProduct(req.params.id, req.apiAuth.userId, req.body);
            res.json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /products/:id
 * Delete (soft-deactivate) a product.
 */
router.delete('/:id',
    requireScopes(SCOPES.PRODUCTS_WRITE),
    async (req, res, next) => {
        try {
            const result = await productsFacade.deleteProduct(req.params.id, req.apiAuth.userId);
            res.json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /products/:id/publish
 * Publish a product. Auto-derives galleryImages from designData.modelMockups.
 */
router.post('/:id/publish',
    requireScopes(SCOPES.PRODUCTS_WRITE),
    async (req, res, next) => {
        try {
            const product = await productsFacade.publishProduct(req.params.id, req.apiAuth.userId);
            res.json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /products/:id/unpublish
 * Unpublish a product.
 */
router.post('/:id/unpublish',
    requireScopes(SCOPES.PRODUCTS_WRITE),
    async (req, res, next) => {
        try {
            const product = await productsFacade.unpublishProduct(req.params.id, req.apiAuth.userId);
            res.json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /products/:id/artworks
 * Upload artwork for a product.
 */
router.post('/:id/artworks',
    requireScopes(SCOPES.PRODUCTS_WRITE, SCOPES.UPLOADS_WRITE),
    async (req, res, next) => {
        try {
            await productsFacade.getProduct(req.params.id, req.apiAuth.userId);
            res.status(501).json({
                error: {
                    code: 'NOT_IMPLEMENTED',
                    message: 'Product artwork upload via API is coming soon. Use POST /uploads/artworks instead.',
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
