import { STORE_BASE_URL } from '@/config';

const BASE_DOMAIN = (import.meta.env.VITE_BASE_DOMAIN || 'techvibz.org').toLowerCase();

export const getStoreUrl = (subdomain: string) => {
  // If we're already on this store's subdomain in the browser, keep the current origin.
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname.toLowerCase();
    if (currentHost === `${subdomain}.${BASE_DOMAIN}`) {
      return window.location.origin;
    }
  }

  // Localhost → route-based store
  if (STORE_BASE_URL.includes('localhost')) {
    return `${STORE_BASE_URL}/store/${subdomain}`;
  }

  // Production → subdomain-based store
  return `https://${subdomain}.${BASE_DOMAIN}`;
};
