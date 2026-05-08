import { useCallback, useEffect, useState } from 'react';
import type { Store, Product } from '@/shared/types';
import { storeApi, storeProductsApi } from '@/lib/api';
import { detectStorefrontType } from '../detectStorefrontType';
import type { StorefrontData } from '../types';
import { mapStoreProductsToProducts } from '../mapStoreProductsToProducts';

type StorefrontLoadState =
  | { status: 'idle' | 'loading'; data: null; error: null }
  | { status: 'ready'; data: StorefrontData; error: null }
  | { status: 'error'; data: null; error: string };

export function useStorefrontData(slug: string | null) {
  const [state, setState] = useState<StorefrontLoadState>({
    status: slug ? 'loading' : 'idle',
    data: null,
    error: null,
  });

  const load = useCallback(async () => {
    if (!slug) return;
    setState({ status: 'loading', data: null, error: null });

    try {
      const storeResp = await storeApi.getBySubdomain(slug);
      if (!storeResp?.success || !storeResp.data) {
        setState({ status: 'error', data: null, error: 'Store not found' });
        return;
      }

      const store = storeResp.data as Store;

      const spResp = await storeProductsApi.listPublic(store.id);
      const storeProducts = spResp?.success ? spResp.data || [] : [];
      const products: Product[] = mapStoreProductsToProducts(store, storeProducts);

      setState({
        status: 'ready',
        data: {
          store,
          products,
          type: detectStorefrontType(store),
        },
        error: null,
      });
    } catch (e: any) {
      setState({
        status: 'error',
        data: null,
        error: e?.message || 'Failed to load store',
      });
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    load();
  }, [slug, load]);

  return { ...state, reload: load };
}

