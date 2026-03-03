/**
 * Webhook Service
 * Manages webhook subscriptions, dispatches events with HMAC-SHA256 signatures,
 * and handles delivery retries.
 */
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const WebhookSubscription = require('../models/WebhookSubscription');
const WebhookDelivery = require('../models/WebhookDelivery');
const { NotFoundError, ValidationError } = require('../core/errors');
const { ALL_WEBHOOK_EVENTS, WEBHOOK_RETRY_SCHEDULE, MAX_WEBHOOK_ATTEMPTS } = require('../core/constants');

/**
 * Hash a webhook secret for storage.
 */
function hashSecret(secret) {
    return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Sign a payload with HMAC-SHA256.
 */
function signPayload(payload, secret) {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Create a webhook subscription.
 */
async function createSubscription(userId, { url, events }) {
    // Validate events
    const invalidEvents = events.filter(e => !ALL_WEBHOOK_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
        throw new ValidationError(`Invalid event type(s): ${invalidEvents.join(', ')}`);
    }

    if (!url || !url.startsWith('https://')) {
        throw new ValidationError('Webhook URL must use HTTPS.');
    }

    // Generate secret for this subscription
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const secretH = hashSecret(secret);

    const subscription = await WebhookSubscription.create({
        ownerUserId: userId,
        url,
        events,
        secretHash: secretH,
    });

    return {
        id: subscription._id,
        url: subscription.url,
        events: subscription.events,
        secret, // Only returned once!
        isActive: subscription.isActive,
        createdAt: subscription.createdAt,
    };
}

/**
 * Update a webhook subscription.
 */
async function updateSubscription(id, userId, { url, events, isActive }) {
    const update = {};

    if (url !== undefined) {
        if (!url.startsWith('https://')) {
            throw new ValidationError('Webhook URL must use HTTPS.');
        }
        update.url = url;
    }

    if (events !== undefined) {
        const invalidEvents = events.filter(e => !ALL_WEBHOOK_EVENTS.includes(e));
        if (invalidEvents.length > 0) {
            throw new ValidationError(`Invalid event type(s): ${invalidEvents.join(', ')}`);
        }
        update.events = events;
    }

    if (isActive !== undefined) {
        update.isActive = isActive;
        if (isActive) {
            update.failureCount = 0;
            update.disabledAt = null;
        }
    }

    const subscription = await WebhookSubscription.findOneAndUpdate(
        { _id: id, ownerUserId: userId },
        update,
        { new: true }
    );

    if (!subscription) {
        throw new NotFoundError('Webhook subscription');
    }

    return {
        id: subscription._id,
        url: subscription.url,
        events: subscription.events,
        isActive: subscription.isActive,
        failureCount: subscription.failureCount,
        updatedAt: subscription.updatedAt,
    };
}

/**
 * Delete a webhook subscription.
 */
async function deleteSubscription(id, userId) {
    const result = await WebhookSubscription.findOneAndDelete({
        _id: id,
        ownerUserId: userId,
    });

    if (!result) {
        throw new NotFoundError('Webhook subscription');
    }

    return { id, deleted: true };
}

/**
 * List webhook subscriptions for a user.
 */
async function listSubscriptions(userId) {
    return await WebhookSubscription.find({ ownerUserId: userId })
        .select('-secretHash')
        .sort({ createdAt: -1 })
        .lean();
}

/**
 * Dispatch a webhook event to all matching subscriptions for a merchant.
 */
async function dispatchEvent(eventType, payload, merchantUserId) {
    const subscriptions = await WebhookSubscription.find({
        ownerUserId: merchantUserId,
        events: eventType,
        isActive: true,
    }).select('+secretHash');

    const eventId = uuidv4();
    const deliveries = [];

    for (const sub of subscriptions) {
        const body = {
            event: eventType,
            event_id: eventId,
            created_at: new Date().toISOString(),
            data: payload,
        };

        const signingSecret = process.env.WEBHOOK_SIGNING_SECRET || 'default_webhook_secret';
        const signature = signPayload(body, signingSecret);

        const delivery = await WebhookDelivery.create({
            webhookId: sub._id,
            eventType,
            eventId,
            payload: body,
            signature,
            status: 'pending',
            attempt: 1,
        });

        // Attempt immediate delivery
        deliverWebhook(delivery._id, sub.url, body, signature, sub._id).catch(() => { });

        deliveries.push(delivery);
    }

    return { eventId, deliveriesCount: deliveries.length };
}

/**
 * Attempt to deliver a webhook.
 */
async function deliverWebhook(deliveryId, url, payload, signature, webhookId) {
    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Shelfmerch-Signature': signature,
                'X-Shelfmerch-Event-Id': payload.event_id,
            },
            timeout: 10000, // 10 second timeout
            validateStatus: () => true, // Don't throw on non-2xx
        });

        const delivery = await WebhookDelivery.findById(deliveryId);
        if (!delivery) return;

        delivery.responseCode = response.status;

        if (response.status >= 200 && response.status < 300) {
            delivery.status = 'success';
            delivery.deliveredAt = new Date();
            await delivery.save();

            // Reset failure count on success
            await WebhookSubscription.findByIdAndUpdate(webhookId, {
                failureCount: 0,
                lastDeliveredAt: new Date(),
            });
        } else {
            delivery.lastError = `HTTP ${response.status}`;
            await scheduleRetry(delivery, webhookId);
        }
    } catch (error) {
        const delivery = await WebhookDelivery.findById(deliveryId);
        if (!delivery) return;

        delivery.lastError = error.message;
        await scheduleRetry(delivery, webhookId);
    }
}

/**
 * Schedule a retry for a failed delivery.
 */
async function scheduleRetry(delivery, webhookId) {
    const retryIndex = delivery.attempt - 1; // 0-based index into retry schedule

    if (retryIndex >= WEBHOOK_RETRY_SCHEDULE.length) {
        delivery.status = 'exhausted';
        await delivery.save();

        // Increment failure count — auto-disable after too many failures
        const sub = await WebhookSubscription.findByIdAndUpdate(
            webhookId,
            { $inc: { failureCount: 1 } },
            { new: true }
        );

        if (sub && sub.failureCount >= 10) {
            sub.isActive = false;
            sub.disabledAt = new Date();
            await sub.save();
        }

        return;
    }

    const delay = WEBHOOK_RETRY_SCHEDULE[retryIndex];
    delivery.nextRetryAt = new Date(Date.now() + delay);
    delivery.status = 'failed';
    await delivery.save();
}

/**
 * Process pending retries (called by a scheduled job).
 */
async function processRetries() {
    const pendingRetries = await WebhookDelivery.find({
        status: 'failed',
        nextRetryAt: { $lte: new Date() },
    }).limit(100);

    for (const delivery of pendingRetries) {
        const subscription = await WebhookSubscription.findById(delivery.webhookId).select('+secretHash');
        if (!subscription || !subscription.isActive) {
            delivery.status = 'exhausted';
            await delivery.save();
            continue;
        }

        // Increment attempt
        delivery.attempt += 1;
        delivery.status = 'pending';
        await delivery.save();

        // Re-deliver
        deliverWebhook(
            delivery._id,
            subscription.url,
            delivery.payload,
            delivery.signature,
            subscription._id
        ).catch(() => { });
    }

    return pendingRetries.length;
}

module.exports = {
    createSubscription,
    updateSubscription,
    deleteSubscription,
    listSubscriptions,
    dispatchEvent,
    processRetries,
    signPayload,
};
