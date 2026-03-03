const mongoose = require('mongoose');

const WebhookDeliverySchema = new mongoose.Schema({
    webhookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebhookSubscription',
        required: true,
        index: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    eventId: {
        type: String,
        required: true, // UUID for idempotency
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    signature: {
        type: String,
        required: true,
    },
    attempt: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'exhausted'],
        default: 'pending',
    },
    responseCode: {
        type: Number,
    },
    nextRetryAt: {
        type: Date,
    },
    lastError: {
        type: String,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

WebhookDeliverySchema.index({ webhookId: 1, createdAt: -1 });
WebhookDeliverySchema.index({ status: 1, nextRetryAt: 1 });
// TTL: auto-clean deliveries after 30 days
WebhookDeliverySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('WebhookDelivery', WebhookDeliverySchema);
