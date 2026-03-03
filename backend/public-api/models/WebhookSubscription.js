const mongoose = require('mongoose');

const WebhookSubscriptionSchema = new mongoose.Schema({
    ownerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    events: [{
        type: String,
        required: true,
    }],
    secretHash: {
        type: String,
        required: true,
        select: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    failureCount: {
        type: Number,
        default: 0,
    },
    lastDeliveredAt: {
        type: Date,
    },
    disabledAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

WebhookSubscriptionSchema.index({ ownerUserId: 1, isActive: 1 });

module.exports = mongoose.model('WebhookSubscription', WebhookSubscriptionSchema);
