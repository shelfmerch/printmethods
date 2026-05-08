import type { Store, Product } from '@/types';

export type StorefrontType = 'default' | 'custom';

export type StorefrontIdentity = {
  slug: string;
};

export type StorefrontData = {
  store: Store;
  products: Product[];
  type: StorefrontType;
};

