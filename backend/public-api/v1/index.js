/**
 * Public API v1 Router
 * Mounts all v1 sub-routers with the shared middleware chain.
 */
const express = require('express');
const router = express.Router();

// OpenAPI/Swagger docs
const { setupDocs } = require('../openapi/swagger');
setupDocs(router);

// Core middleware
const { requestIdMiddleware } = require('../core/requestId');
const { enforceHttps } = require('../middleware/enforceHttps');
const { parsePublicCredential } = require('../middleware/parsePublicCredential');
const { requirePublicAuth } = require('../middleware/requirePublicAuth');
const { publicRateLimit } = require('../middleware/publicRateLimit');
const { usageMeter } = require('../middleware/usageMeter');
const { publicResponseFormatter } = require('../middleware/publicResponseFormatter');
const { publicErrorHandler } = require('../middleware/publicErrorHandler');

// Route handlers
const authRoutes = require('./routes/auth');
const shopsRoutes = require('./routes/shops');
const catalogRoutes = require('./routes/catalog');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const uploadsRoutes = require('./routes/uploads');
const webhooksRoutes = require('./routes/webhooks');

// ─── Shared middleware chain ─────────────────────────────────────────

// Debug logging for Phase 1 wiring validation
router.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('[Public API v1] Incoming:', req.method, req.originalUrl);
    next();
});

// Request ID + HTTPS enforcement + response formatting
router.use(requestIdMiddleware);
router.use(enforceHttps);
router.use(publicResponseFormatter);

// ─── Auth routes (some don't require auth) ───────────────────────────
router.use('/auth', authRoutes);

// ─── Protected routes ────────────────────────────────────────────────
// These routes require authentication, rate limiting, and usage metering
router.use(parsePublicCredential);
router.use(requirePublicAuth);
router.use(publicRateLimit);
router.use(usageMeter);

// Domain routes
router.use('/shops', shopsRoutes);
router.use('/catalog', catalogRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/webhooks', webhooksRoutes);

// ─── Error handler (must be last) ────────────────────────────────────
router.use(publicErrorHandler);

module.exports = router;
