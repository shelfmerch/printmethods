/**
 * Public API v2 Scaffold
 * Returns 501 for all routes — placeholder for future API version.
 */
const express = require('express');
const router = express.Router();
const { requestIdMiddleware } = require('../core/requestId');

router.use(requestIdMiddleware);

// All v2 routes return 501 Not Implemented
router.all('/{*path}', (req, res) => {
    res.status(501).json({
        error: {
            code: 'VERSION_NOT_AVAILABLE',
            message: 'API v2 is not yet available. Please use /api/v1 for all current endpoints.',
        },
        meta: {
            request_id: req.requestId,
            current_version: 'v1',
            deprecated: false,
        },
    });
});

module.exports = router;
