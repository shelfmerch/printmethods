import type { Store, Product } from '@/shared/types';

export type StorefrontType = 'default' | 'custom';

export type StorefrontIdentity = {
  slug: string;
};

export type StorefrontData = {
  store: Store;
  products: Product[];
  type: StorefrontType;
};

