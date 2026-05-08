import type { Store } from '@/types';
import type { StorefrontType } from './types';

export function detectStorefrontType(store: Store): StorefrontType {
  return store.useBuilder && store.builder ? 'custom' : 'default';
}

