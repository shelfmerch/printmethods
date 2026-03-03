/**
 * Products Routes — Public API v1
 */
const express = require('express');
const router = express.Router();
const productsFacade = require('../../services/productsFacade');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse, paginatedResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');

/**
 * GET /products
 * List products across the user's stores.
 */
router.get('/',
    requireScopes(SCOPES.PRODUCTS_READ),
    async (req, res, next) => {
        try {
            const { store_id, status, page = 1, limit = 20 } = req.query;
            const result = await productsFacade.listProducts(req.apiAuth.userId, {
                storeId: store_id,
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
 * Create a product.
 */
router.post('/',
    requireScopes(SCOPES.PRODUCTS_WRITE),
    async (req, res, next) => {
        try {
            const product = await productsFacade.createProduct(req.apiAuth.userId, req.body);
            res.status(201).json(successResponse(product));
        } catch (error) {
            next(error);
        }
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
 * Publish a product.
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
 * Upload artwork for a product (delegates to uploads).
 */
router.post('/:id/artworks',
    requireScopes(SCOPES.PRODUCTS_WRITE, SCOPES.UPLOADS_WRITE),
    async (req, res, next) => {
        try {
            // Verify product exists and belongs to user
            await productsFacade.getProduct(req.params.id, req.apiAuth.userId);

            // Artwork upload will be handled by multer middleware at the router level
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
