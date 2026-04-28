/**
 * Single source of truth for HTTP calls from the Shopify embedded app.
 * CDN App Bridge may expose `authenticatedFetch` or only `idToken()` (fetch interception is separate).
 * We treat either as embedded and always send a session JWT in Authorization when calling our API.
 */

import { SHOPIFY_API_BASE_URL } from '@/config';

export class ShopifySessionError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Array<{ msg: string; param: string }>,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ShopifySessionError';
  }
}

type ShopifyGlobal = {
  authenticatedFetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  idToken?: () => Promise<string>;
};

const shopifyGlobal = (): ShopifyGlobal | undefined =>
  typeof window !== 'undefined' ? (window as Window & { shopify?: ShopifyGlobal }).shopify : undefined;

/** True when App Bridge can provide a Shopify session token (embedded admin). */
export const isEmbeddedShopifyApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const s = shopifyGlobal();
  return typeof s?.authenticatedFetch === 'function' || typeof s?.idToken === 'function';
};

/**
 * Embedded: session JWT via `authenticatedFetch` or `idToken()` + fetch (never ShelfMerch in Authorization).
 * Standalone: Bearer ShelfMerch JWT from localStorage.
 */
export const authenticatedApiFetch = (
  input: string | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const shopify = shopifyGlobal();
  const headers = new Headers(init.headers as HeadersInit);
  if (!headers.has('ngrok-skip-browser-warning')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  if (shopify?.authenticatedFetch) {
    return shopify.authenticatedFetch(input, {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
    });
  }

  if (shopify?.idToken) {
    return shopify.idToken().then((sessionJwt) => {
      if (sessionJwt) {
        headers.set('Authorization', `Bearer ${sessionJwt}`);
      }
      return fetch(input, {
        ...init,
        headers,
        credentials: init.credentials ?? 'include',
      });
    });
  }

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });
};

const resolveShopifyBaseUrl = (): string => SHOPIFY_API_BASE_URL.replace(/\/$/, '');

/**
 * Shopify Admin API base calls (same backend as SHOPIFY_API_BASE_URL) with session token via idToken.
 * Prefer `authenticatedApiFetch` for `/api/*`; use this when you need an explicit Bearer session JWT.
 */
export const shopifySessionFetch = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const shopify = shopifyGlobal();
  if (!shopify || typeof shopify.idToken !== 'function') {
    throw new ShopifySessionError('Shopify App Bridge session token API is unavailable', 401);
  }

  const sessionJwt = await shopify.idToken();
  if (!sessionJwt) {
    throw new ShopifySessionError('Failed to obtain Shopify session token', 401);
  }

  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${resolveShopifyBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    Authorization: `Bearer ${sessionJwt}`,
    ...(options.headers as Record<string, string> | undefined),
  };

  if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ShopifySessionError(
      (payload as { message?: string })?.message || `Shopify API request failed with status ${response.status}`,
      response.status,
      (payload as { errors?: Array<{ msg: string; param: string }> })?.errors,
      payload
    );
  }

  return payload as T;
};
