/**
 * Centralized configuration for the frontend.
 * These values are derived from environment variables with safe fallbacks for local development.
 */

// Basic health check to see if we're in dev or prod
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

// API Base URL - The backend endpoint (must point at the Express `/api/*` routes).
// We normalize common misconfigs like `/app` (frontend mount) to `/api` (backend API prefix),
// and we ensure absolute URLs include the `/api` suffix.
const normalizeApiBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return '/api';

  // Relative deployments (recommended for prod) should target `/api`.
  if (trimmed === '/app') return '/api';
  if (trimmed.startsWith('/')) {
    return trimmed === '/api' ? trimmed : `${trimmed}/api`;
  }

  // Absolute base: if someone points to `.../app`, swap it to `.../api`.
  if (/\/app$/i.test(trimmed)) return trimmed.replace(/\/app$/i, '/api');
  if (/\/api$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api`;
};

// In production, we favor VITE_API_BASE_URL for explicit targeting, falling back to relative /api.
// In development, we use VITE_API_URL (full origin) with a localhost fallback.
const API_BASE_URL_RAW = IS_PROD
  ? (import.meta.env.VITE_API_BASE_URL || '/api')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5002/api');

export const API_BASE_URL = normalizeApiBaseUrl(API_BASE_URL_RAW);

// For Shopify OAuth, we MUST use the public ngrok/production URL for both start and callback.
// If VITE_API_BASE_URL is set (e.g. to ngrok), we use that to ensure cookies are set on the correct domain.
export const SHOPIFY_API_BASE_URL = import.meta.env.VITE_SHOPIFY_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  API_BASE_URL;

// Store Base URL - Where the storefronts are hosted
// In development, this is typically localhost:8080 or similar
// In production, this should be the main domain, e.g., https://shelfmerch.com
export const STORE_BASE_URL = import.meta.env.VITE_STORE_BASE_URL || 'http://localhost:8080';

// Helper to get raw API URL (without /api suffix if needed)
export const RAW_API_URL = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

console.log(`[Config] Running in ${IS_DEV ? 'development' : 'production'} mode`);
console.log(`[Config] API Base URL: ${API_BASE_URL}`);
console.log(`[Config] Store Base URL: ${STORE_BASE_URL}`);
