/**
 * Public API Constants
 */

// Available scopes for API keys and OAuth tokens
const SCOPES = {
    SHOPS_READ: 'shops.read',
    CATALOG_READ: 'catalog.read',
    PRODUCTS_READ: 'products.read',
    PRODUCTS_WRITE: 'products.write',
    ORDERS_READ: 'orders.read',
    ORDERS_WRITE: 'orders.write',
    UPLOADS_WRITE: 'uploads.write',
    WEBHOOKS_MANAGE: 'webhooks.manage',
};

const ALL_SCOPES = Object.values(SCOPES);

// Subscription plan codes
const PLAN_CODES = {
    FREE: 'free',
    STARTER: 'starter',
    BUSINESS: 'business',
    ENTERPRISE: 'enterprise',
};

// Default plan limits (RPM = requests per minute)
const PLAN_LIMITS = {
    [PLAN_CODES.FREE]: { rpm: 60, monthlyRequests: 10000 },
    [PLAN_CODES.STARTER]: { rpm: 300, monthlyRequests: 100000 },
    [PLAN_CODES.BUSINESS]: { rpm: 1200, monthlyRequests: 1000000 },
    [PLAN_CODES.ENTERPRISE]: { rpm: 5000, monthlyRequests: -1 }, // -1 = unlimited
};

// Webhook event types
const WEBHOOK_EVENTS = {
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_FULFILLED: 'order.fulfilled',
    PRODUCT_PUBLISHED: 'product.published',
    PRODUCT_UPDATED: 'product.updated',
};

const ALL_WEBHOOK_EVENTS = Object.values(WEBHOOK_EVENTS);

// Webhook retry schedule (in milliseconds)
const WEBHOOK_RETRY_SCHEDULE = [
    1 * 60 * 1000,      // 1 minute
    5 * 60 * 1000,      // 5 minutes
    15 * 60 * 1000,     // 15 minutes
    60 * 60 * 1000,     // 1 hour
    6 * 60 * 60 * 1000, // 6 hours
];

const MAX_WEBHOOK_ATTEMPTS = WEBHOOK_RETRY_SCHEDULE.length + 1; // initial + retries

// OAuth constants
const OAUTH = {
    ACCESS_TOKEN_TTL: '15m',
    ACCESS_TOKEN_TTL_SECONDS: 900,
    REFRESH_TOKEN_TTL_DAYS: 30,
    AUTH_CODE_TTL_SECONDS: 600, // 10 minutes
    CODE_CHALLENGE_METHOD: 'S256',
};

// Credential types
const CREDENTIAL_TYPES = {
    OAUTH_ACCESS_TOKEN: 'oauth_access_token',
    PERSONAL_ACCESS_TOKEN: 'personal_access_token',
    API_KEY: 'api_key',
};

module.exports = {
    SCOPES,
    ALL_SCOPES,
    PLAN_CODES,
    PLAN_LIMITS,
    WEBHOOK_EVENTS,
    ALL_WEBHOOK_EVENTS,
    WEBHOOK_RETRY_SCHEDULE,
    MAX_WEBHOOK_ATTEMPTS,
    OAUTH,
    CREDENTIAL_TYPES,
};
