/**
 * Uploads Routes — Public API v1
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadsFacade = require('../../services/uploadsFacade');
const { requireScopes } = require('../../middleware/requireScopes');
const { successResponse } = require('../../core/response');
const { SCOPES } = require('../../core/constants');
const { ValidationError } = require('../../core/errors');

// Configure multer for memory storage (max 10MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ValidationError(`Unsupported file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`));
        }
    },
});

/**
 * POST /uploads/artworks
 * Upload an artwork file.
 */
router.post('/artworks',
    requireScopes(SCOPES.UPLOADS_WRITE),
    upload.single('file'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new ValidationError('No file provided. Upload a file with field name "file".');
            }

            const result = await uploadsFacade.uploadArtwork(req.file, req.apiAuth.userId);
            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /uploads/:id
 * Get upload metadata.
 */
router.get('/:id',
    requireScopes(SCOPES.UPLOADS_WRITE),
    async (req, res, next) => {
        try {
            const upload = await uploadsFacade.getUpload(req.params.id);
            res.json(successResponse(upload));
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
