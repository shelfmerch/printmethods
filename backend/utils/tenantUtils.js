/**
 * Tenant Utilities
 * Extracts tenant (store) slug from hostname for multi-tenant subdomain support
 */

// Reserved subdomains that should not be treated as tenant slugs
const RESERVED_SUBDOMAINS = ['www', 'shelfmerch', 'admin', 'api', 'app'];
const BASE_DOMAIN = (process.env.BASE_DOMAIN || 'techvibz.org').toLowerCase();

/**
 * Extract tenant slug from hostname
 * @param {string} hostname - The hostname from the request (e.g., "xyz.techvibz.org:3000")
 * @returns {string | null} - The tenant slug or null if not a tenant subdomain
 *
 * Only hostnames under BASE_DOMAIN are treated as tenants (never guess from foreign domains).
 *
 * Examples:
 * - "xyz.techvibz.org" -> "xyz"
 * - "www.techvibz.org" -> null (apex / reserved)
 * - "techvibz.org" -> null (root domain)
 * - "techvibz.org" with BASE_DOMAIN still shelfmerch.in -> null (not our host)
 * - "localhost" -> null
 * - "xyz.localhost" -> "xyz" (dev)
 */
function extractTenantFromHost(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    return null;
  }

  const hostnameWithoutPort = hostname.split(':')[0].toLowerCase().trim();

  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort === '127.0.0.1') {
    return null;
  }

  if (hostnameWithoutPort.endsWith('.localhost')) {
    const localhostSuffix = '.localhost';
    const subdomain = hostnameWithoutPort.slice(0, -localhostSuffix.length);
    if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
      return subdomain;
    }
    return null;
  }

  const baseLower = BASE_DOMAIN;
  const baseSuffix = `.${baseLower}`;

  if (hostnameWithoutPort === baseLower || hostnameWithoutPort === `www.${baseLower}`) {
    return null;
  }

  if (!hostnameWithoutPort.endsWith(baseSuffix)) {
    return null;
  }

  const subdomain = hostnameWithoutPort.slice(0, -baseSuffix.length);
  if (!subdomain || RESERVED_SUBDOMAINS.some((r) => subdomain === r || subdomain.startsWith(`${r}.`))) {
    return null;
  }

  return subdomain;
}

module.exports = {
  extractTenantFromHost,
  RESERVED_SUBDOMAINS,
  BASE_DOMAIN
};


