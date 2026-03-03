/**
 * OpenAPI/Swagger Configuration and Docs Route
 * Serves the Swagger UI at /api/v1/docs and the raw spec at /api/v1/openapi.json.
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { ALL_SCOPES, ALL_WEBHOOK_EVENTS } = require('../core/constants');
const { INTERNAL_OAUTH_ENABLED } = require('../../config/features');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'ShelfMerch Public API',
            version: '1.0.0',
            description: `
# ShelfMerch Developer API

The ShelfMerch Public API enables developers to programmatically manage shops, products, orders, and more.

## Authentication

The API supports three authentication methods:

1. **OAuth 2.0** — Authorization Code + PKCE flow for third-party integrations
2. **Personal Access Tokens (PAT)** — Long-lived tokens for personal automation
3. **API Keys** — Machine-to-machine authentication via \`X-API-Key\` header

## Rate Limiting

All authenticated requests are rate-limited based on your subscription plan:

| Plan | Requests/Minute |
|------|----------------|
| Free | 60 |
| Starter | 300 |
| Business | 1,200 |
| Enterprise | Custom |

Rate limit headers are included in every response:
- \`X-RateLimit-Limit\` — Your plan's RPM limit
- \`X-RateLimit-Remaining\` — Remaining requests in current window
- \`X-RateLimit-Reset\` — Unix timestamp when the window resets

## Response Format

All responses follow a consistent envelope:

**Success:**
\`\`\`json
{
  "data": { ... },
  "meta": { "request_id": "uuid" }
}
\`\`\`

**Error:**
\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
\`\`\`

## Webhook Events

Subscribe to real-time events: ${ALL_WEBHOOK_EVENTS.map(e => `\`${e}\``).join(', ')}
      `,
            contact: {
                name: 'ShelfMerch API Support',
                url: 'https://shelfmerch.com/support',
            },
            license: {
                name: 'MIT',
            },
        },
        servers: [
            {
                url: process.env.PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: INTERNAL_OAUTH_ENABLED
                        ? 'OAuth2 access token or Personal Access Token'
                        : 'Personal Access Token',
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API key for machine-to-machine auth',
                },
                oauth2: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: '/api/v1/auth/oauth/authorize',
                            tokenUrl: '/api/v1/auth/oauth/token',
                            scopes: ALL_SCOPES.reduce((acc, s) => {
                                acc[s] = `Access to ${s.replace('.', ' ')} operations`;
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string', example: 'NOT_FOUND' },
                                message: { type: 'string', example: 'Resource not found' },
                                details: { type: 'object', nullable: true },
                            },
                        },
                    },
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        request_id: { type: 'string', format: 'uuid' },
                        pagination: {
                            type: 'object',
                            properties: {
                                current_page: { type: 'integer', example: 1 },
                                per_page: { type: 'integer', example: 20 },
                                total_count: { type: 'integer', example: 100 },
                                total_pages: { type: 'integer', example: 5 },
                            },
                        },
                    },
                },
                Shop: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'My Store' },
                        slug: { type: 'string', example: 'my-store' },
                        type: { type: 'string', enum: ['native', 'shopify', 'etsy', 'woocommerce'] },
                        is_active: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Blueprint: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Classic T-Shirt' },
                        description: { type: 'string' },
                        category_id: { type: 'string' },
                        base_price: { type: 'number', example: 299 },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        store_id: { type: 'string' },
                        title: { type: 'string', example: 'My Custom Tee' },
                        selling_price: { type: 'number', example: 499 },
                        status: { type: 'string', enum: ['draft', 'published'] },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        store_id: { type: 'string' },
                        status: { type: 'string', enum: ['on-hold', 'paid', 'in-production', 'shipped', 'delivered', 'fulfilled', 'cancelled', 'refunded'] },
                        total: { type: 'number', example: 599 },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                WebhookSubscription: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        url: { type: 'string', format: 'uri', example: 'https://example.com/webhooks' },
                        events: { type: 'array', items: { type: 'string' } },
                        is_active: { type: 'boolean' },
                    },
                },
            },
        },
        security: [
            { bearerAuth: [] },
            { apiKeyAuth: [] },
        ],
        paths: {
            '/shops': {
                get: {
                    tags: ['Shops'],
                    summary: 'List shops',
                    security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    ],
                    responses: {
                        200: { description: 'List of shops' },
                        401: { description: 'Authentication required' },
                        429: { description: 'Rate limit exceeded' },
                    },
                },
            },
            '/shops/{shopId}': {
                get: {
                    tags: ['Shops'],
                    summary: 'Get a shop',
                    parameters: [{ name: 'shopId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Shop details' }, 404: { description: 'Shop not found' } },
                },
            },
            '/catalog/blueprints': {
                get: {
                    tags: ['Catalog'],
                    summary: 'List blueprints',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                        { name: 'category', in: 'query', schema: { type: 'string' } },
                    ],
                    responses: { 200: { description: 'List of blueprints' } },
                },
            },
            '/catalog/blueprints/{id}/variants': {
                get: {
                    tags: ['Catalog'],
                    summary: 'Get blueprint variants',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'List of variants' } },
                },
            },
            '/products': {
                get: {
                    tags: ['Products'],
                    summary: 'List products',
                    responses: { 200: { description: 'List of products' } },
                },
                post: {
                    tags: ['Products'],
                    summary: 'Create a product',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
                    },
                    responses: { 201: { description: 'Product created' } },
                },
            },
            '/products/{id}': {
                get: { tags: ['Products'], summary: 'Get a product', responses: { 200: { description: 'Product details' } } },
                put: { tags: ['Products'], summary: 'Update a product', responses: { 200: { description: 'Product updated' } } },
                delete: { tags: ['Products'], summary: 'Delete a product', responses: { 200: { description: 'Product deleted' } } },
            },
            '/products/{id}/publish': {
                post: { tags: ['Products'], summary: 'Publish a product', responses: { 200: { description: 'Product published' } } },
            },
            '/orders': {
                get: {
                    tags: ['Orders'],
                    summary: 'List orders',
                    parameters: [
                        { name: 'status', in: 'query', schema: { type: 'string' } },
                        { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
                        { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    ],
                    responses: { 200: { description: 'List of orders' } },
                },
                post: {
                    tags: ['Orders'],
                    summary: 'Create an order',
                    responses: { 201: { description: 'Order created' } },
                },
            },
            '/orders/{id}': {
                get: { tags: ['Orders'], summary: 'Get an order', responses: { 200: { description: 'Order details' } } },
            },
            '/orders/{id}/cancel': {
                post: { tags: ['Orders'], summary: 'Cancel an order', responses: { 200: { description: 'Order cancelled' } } },
            },
            '/orders/{id}/fulfillment': {
                get: { tags: ['Orders'], summary: 'Get fulfillment status', responses: { 200: { description: 'Fulfillment details' } } },
            },
            '/webhooks': {
                get: { tags: ['Webhooks'], summary: 'List webhook subscriptions', responses: { 200: { description: 'List of subscriptions' } } },
                post: {
                    tags: ['Webhooks'],
                    summary: 'Create a webhook subscription',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        url: { type: 'string', format: 'uri' },
                                        events: { type: 'array', items: { type: 'string', enum: ALL_WEBHOOK_EVENTS } },
                                    },
                                    required: ['url', 'events'],
                                },
                            },
                        },
                    },
                    responses: { 201: { description: 'Webhook subscription created' } },
                },
            },
            '/webhooks/{id}': {
                put: { tags: ['Webhooks'], summary: 'Update a webhook', responses: { 200: { description: 'Webhook updated' } } },
                delete: { tags: ['Webhooks'], summary: 'Delete a webhook', responses: { 200: { description: 'Webhook deleted' } } },
            },
            '/auth/oauth/authorize': {
                get: { tags: ['Auth'], summary: 'Start OAuth authorization', responses: { 200: { description: 'Authorization parameters' } } },
                post: { tags: ['Auth'], summary: 'Grant authorization', responses: { 201: { description: 'Authorization code generated' } } },
            },
            '/auth/oauth/token': {
                post: {
                    tags: ['Auth'],
                    summary: 'Exchange code/refresh for tokens',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        grant_type: { type: 'string', enum: ['authorization_code', 'refresh_token'] },
                                        code: { type: 'string' },
                                        client_id: { type: 'string' },
                                        code_verifier: { type: 'string' },
                                        refresh_token: { type: 'string' },
                                    },
                                    required: ['grant_type', 'client_id'],
                                },
                            },
                        },
                    },
                    responses: { 200: { description: 'Token response' } },
                },
            },
            '/uploads/artworks': {
                post: {
                    tags: ['Uploads'],
                    summary: 'Upload artwork',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: { type: 'string', format: 'binary' },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 201: { description: 'Artwork uploaded' } },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'OAuth2, API keys, and token management' },
            { name: 'Shops', description: 'Shop/store management' },
            { name: 'Catalog', description: 'Browse blueprints and variants' },
            { name: 'Products', description: 'Product lifecycle management' },
            { name: 'Orders', description: 'Order management' },
            { name: 'Uploads', description: 'File uploads' },
            { name: 'Webhooks', description: 'Webhook subscription management' },
        ],
    },
    apis: [], // We define paths inline above
};

if (!INTERNAL_OAUTH_ENABLED) {
    options.definition.info.description = `
# ShelfMerch Developer API

The ShelfMerch Public API enables developers to programmatically manage shops, products, orders, and more.

## Authentication

Internal OAuth is temporarily disabled in Phase 1.

The API supports two authentication methods:

1. **Personal Access Tokens (PAT)** - Long-lived tokens for personal automation
2. **API Keys** - Machine-to-machine authentication via \`X-API-Key\` header

## Rate Limiting

All authenticated requests are rate-limited based on your subscription plan:

| Plan | Requests/Minute |
|------|----------------|
| Free | 60 |
| Starter | 300 |
| Business | 1,200 |
| Enterprise | Custom |

Rate limit headers are included in every response:
- \`X-RateLimit-Limit\` - Your plan's RPM limit
- \`X-RateLimit-Remaining\` - Remaining requests in current window
- \`X-RateLimit-Reset\` - Unix timestamp when the window resets

## Response Format

All responses follow a consistent envelope:

**Success:**
\`\`\`json
{
  "data": { ... },
  "meta": { "request_id": "uuid" }
}
\`\`\`

**Error:**
\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
\`\`\`

## Webhook Events

Subscribe to real-time events: ${ALL_WEBHOOK_EVENTS.map(e => `\`${e}\``).join(', ')}
      `;

    delete options.definition.components.securitySchemes.oauth2;
    delete options.definition.paths['/auth/oauth/authorize'];
    delete options.definition.paths['/auth/oauth/token'];

    options.definition.tags = options.definition.tags.map((tag) => (
        tag.name === 'Auth'
            ? { ...tag, description: 'API keys and personal token management' }
            : tag
    ));
}

const specs = swaggerJsdoc(options);

/**
 * Mount swagger docs on a router.
 */
function setupDocs(router) {
    // Serve OpenAPI spec as JSON
    router.get('/openapi.json', (req, res) => {
        res.json(specs);
    });

    // Serve Swagger UI
    // NOTE: swagger-ui-express doesn't resolve asset paths correctly when
    // mounted on nested Express routers (app → /api → /v1 → /docs).
    // Separating `serve` and `setup` + using `swaggerUrl` fixes this.
    if (process.env.PUBLIC_API_DOCS_ENABLED !== 'false') {
        router.use('/docs', swaggerUi.serve);
        router.get('/docs', swaggerUi.setup(specs, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'ShelfMerch API Documentation',
            swaggerUrl: '/api/v1/openapi.json',
        }));
    }
}

module.exports = { setupDocs, specs };
