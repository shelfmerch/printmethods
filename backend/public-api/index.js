/**
 * Public API Entry Point
 * Main router that mounts v1 and v2, gated behind PUBLIC_API_ENABLED flag.
 */
const express = require('express');
const router = express.Router();

// Check feature flag
const isEnabled = () => {
    return process.env.PUBLIC_API_ENABLED === 'true';
};

// Feature flag middleware
router.use((req, res, next) => {
    if (!isEnabled()) {
        return res.status(503).json({
            error: {
                code: 'API_DISABLED',
                message: 'The public API is not currently enabled.',
            },
        });
    }
    next();
});

// Mount versioned routers
const v1Router = require('./v1');
const v2Router = require('./v2');

router.use('/v1', v1Router);
router.use('/v2', v2Router);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'ShelfMerch Public API',
        versions: {
            v1: { status: 'stable', base_url: '/api/v1' },
            v2: { status: 'coming_soon', base_url: '/api/v2' },
        },
        documentation: '/api/v1/docs',
    });
});

module.exports = router;
