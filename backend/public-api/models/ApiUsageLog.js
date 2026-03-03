const mongoose = require('mongoose');

const ApiUsageLogSchema = new mongoose.Schema({
    apiKeyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey',
        required: true,
    },
    planCode: {
        type: String,
        required: true,
    },
    // Monthly period: "2026-03"
    periodMonth: {
        type: String,
        required: true,
    },
    // UTC minute bucket for rate limiting: ISO timestamp truncated to minute
    bucketMinute: {
        type: Date,
        required: true,
    },
    requestCount: {
        type: Number,
        default: 0,
    },
    // HTTP status class: "2xx", "4xx", "5xx"
    statusClass: {
        type: String,
        enum: ['2xx', '3xx', '4xx', '5xx'],
    },
    // Route key: "GET /api/v1/shops"
    routeKey: {
        type: String,
    },
}, {
    timestamps: true,
});

// Rate limit lookups: find current minute bucket for a key
ApiUsageLogSchema.index({ apiKeyId: 1, bucketMinute: 1 });
// Monthly usage aggregation
ApiUsageLogSchema.index({ apiKeyId: 1, periodMonth: 1 });
// Route-level analytics
ApiUsageLogSchema.index({ routeKey: 1, periodMonth: 1 });
// TTL: auto-clean usage logs after 90 days
ApiUsageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ApiUsageLog', ApiUsageLogSchema);
