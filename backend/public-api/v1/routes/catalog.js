/**
 * Catalog Routes — Public API v1
 */
const express = require('express');
const router = express.Router();
const catalogFacade = require('../../services/catalogFacade');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse, paginatedResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');

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
