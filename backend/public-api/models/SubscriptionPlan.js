const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        enum: ['free', 'starter', 'business', 'enterprise'],
    },
    name: {
        type: String,
        required: true,
    },
    limits: {
        rpm: { type: Number, required: true },           // Requests per minute
        monthlyRequests: { type: Number, required: true }, // -1 = unlimited
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
