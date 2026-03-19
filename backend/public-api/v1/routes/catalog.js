/**
 * Catalog Routes — Public API v1
 */
const express = require('express');
const router = express.Router();
const catalogFacade = require('../../services/catalogFacade');
const catalogService = require('../../../services/catalog.service');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse, paginatedResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');

/**
 * GET /catalog/products
 * List catalog products (new DTO shape).
 */
router.get('/products',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const {
                categoryId,
                subcategory,
                search,
                page = 1,
                limit = 20,
            } = req.query;

            const result = await catalogService.listCatalogProducts({
                categoryId,
                subcategory,
                search,
                page: parseInt(page) || 1,
                limit: Math.min(parseInt(limit) || 20, 100),
            });

            res.json(paginatedResponse(result.data, {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
            }));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /catalog/products/:catalogProductId
 * Get catalog product detail.
 */
router.get('/products/:catalogProductId',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const product = await catalogService.getCatalogProductDetail(req.params.catalogProductId);
            res.json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /catalog/products/:catalogProductId/variants
 * Get variants for a catalog product.
 */
router.get('/products/:catalogProductId/variants',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const { color, size } = req.query;
            const variants = await catalogService.getCatalogVariants(req.params.catalogProductId, { color, size });
            res.json(successResponse(variants));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /catalog/blueprints
 * List catalog blueprints (base products).
 */
router.get('/blueprints',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const { page = 1, limit = 20, category } = req.query;
            const result = await catalogFacade.listBlueprints({
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                category,
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
 * GET /catalog/blueprints/:id
 * Get a blueprint.
 */
router.get('/blueprints/:id', requireScopes(SCOPES.CATALOG_READ), async (req, res, next) => {
    try {
        const blueprint = await catalogFacade.getBlueprint(req.params.id);
        res.json(successResponse(blueprint));
    } catch (error) {
        next(error);
    }
});

/**
 * GET /catalog/blueprints/:id/variants
 * Get variants for a specific blueprint.
 */
router.get('/blueprints/:id/variants',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const variants = await catalogFacade.getBlueprintVariants(req.params.id);
            res.json(successResponse(variants));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /catalog/print-providers
 * List available print providers.
 */
router.get('/print-providers',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const providers = await catalogFacade.listPrintProviders();
            res.json(successResponse(providers));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /catalog/pricing
 * Get catalog pricing information.
 */
router.get('/pricing',
    requireScopes(SCOPES.CATALOG_READ),
    async (req, res, next) => {
        try {
            const { product_type_code } = req.query;
            const pricing = await catalogFacade.getCatalogPricing({
                productTypeCode: product_type_code,
            });
            res.json(successResponse(pricing));
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
