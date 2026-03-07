/**
 * Uploads Facade Service
 * Wraps existing S3 upload utility for public API.
 */
const { NotFoundError } = require('../core/errors');

/**
 * Upload artwork via the public API.
 * Delegates to the existing S3 upload utility.
 */
async function uploadArtwork(file, userId) {
    // Reuse existing S3 upload utility
    const { uploadToS3 } = require('../../utils/s3Upload');

    const result = await uploadToS3(
        file.buffer,
        file.originalname,
        `public-api/artworks/${userId}`
    );

    return {
        id: result.key || result.Key,
        url: result.url || result.Location,
        file_name: file.originalname,
        content_type: file.mimetype,
        size: file.size,
        uploaded_at: new Date().toISOString(),
    };
}

/**
 * Get an upload by its key (S3 key).
 */
async function getUpload(uploadKey) {
    // In a full implementation this would query a uploads metadata table
    // For now we return the S3 URL pattern
    const bucket = process.env.AWS_S3_BUCKET || 'shelfmerch-uploads';
    const region = process.env.AWS_REGION || 'ap-south-1';

    return {
        id: uploadKey,
        url: `https://${bucket}.s3.${region}.amazonaws.com/${uploadKey}`,
    };
}

module.exports = {
    uploadArtwork,
    getUpload,
};
