import { useLocation, useParams } from 'react-router-dom';
import { getTenantSlugFromLocation } from '@/utils/tenantUtils';
import type { StorefrontIdentity } from '../types';

export function useStorefrontIdentity(): StorefrontIdentity | null {
  const params = useParams<{ subdomain?: string; slug?: string }>();
  const location = useLocation();
  const slug = getTenantSlugFromLocation(location, params);
  if (!slug) return null;
  return { slug };
}

