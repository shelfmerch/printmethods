import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/shared/types';
import StoreLayout from '@/modules/storefront/shared/components/StoreLayout';
import { buildStorePath } from '@/shared/utils/tenantUtils';
import { useStorefrontIdentity } from '@/modules/storefront/shared/useStorefrontIdentity';
import { useStorefrontData } from '@/modules/storefront/shared/store/useStorefrontData';
import { DefaultStorefront } from '@/modules/storefront/default/components/DefaultStorefront';
import { CustomStorefront } from '@/modules/storefront/custom/renderers/CustomStorefront';

export default function StorefrontHomePage() {
  const navigate = useNavigate();
  const identity = useStorefrontIdentity();
  const slug = identity?.slug || null;
  const { status, data } = useStorefrontData(slug);

  const store = data?.store ?? null;
  const products = data?.products ?? [];

  const onProductClick = useMemo(
    () => (product: Product) => {
      if (!store) return;
      navigate(buildStorePath(`/product/${product.id}`, store.subdomain));
    },
    [navigate, store]
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-6">The store "{slug}" does not exist.</p>
          <Link to={buildStorePath('/', slug || undefined)}>
            <Button>Go to ShelfMerch</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StoreLayout store={store} products={products}>
      {data?.type === 'custom' ? (
        <CustomStorefront store={store} products={products} onProductClick={onProductClick} />
      ) : (
        <DefaultStorefront store={store} products={products} onProductClick={onProductClick} />
      )}
    </StoreLayout>
  );
}

