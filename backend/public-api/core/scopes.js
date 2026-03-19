/**
 * Store-scoped Public API scopes (v2)
 */

const SCOPES = {
  // Catalog (read-only for all API consumers)
  READ_CATALOG: 'read:catalog',

  // Products
  READ_PRODUCTS: 'read:products',
  WRITE_PRODUCTS: 'write:products',

  // Orders
  READ_ORDERS: 'read:orders',
  WRITE_ORDERS: 'write:orders',

  // Uploads
  READ_UPLOADS: 'read:uploads',
  WRITE_UPLOADS: 'write:uploads',

  // Webhooks
  READ_WEBHOOKS: 'read:webhooks',
  WRITE_WEBHOOKS: 'write:webhooks',

  // Store admin — plan, API keys, settings
  ADMIN_STORE: 'admin:store',
};

// Default scopes assigned when none are specified
const DEFAULT_SCOPES = [
  SCOPES.READ_CATALOG,
  SCOPES.READ_PRODUCTS,
  SCOPES.WRITE_PRODUCTS,
  SCOPES.READ_ORDERS,
  SCOPES.WRITE_ORDERS,
  SCOPES.READ_UPLOADS,
  SCOPES.WRITE_UPLOADS,
  SCOPES.READ_WEBHOOKS,
  SCOPES.WRITE_WEBHOOKS,
];

// Scopes that apply to every valid credential (cannot be removed)
const ALWAYS_GRANTED = [SCOPES.READ_CATALOG];

// Valid scope strings for input validation
const ALL_SCOPES = Object.values(SCOPES);

module.exports = {
  SCOPES,
  DEFAULT_SCOPES,
  ALWAYS_GRANTED,
  ALL_SCOPES,
};

