import React, { useMemo } from 'react';
import type { Product, Store } from '@/shared/types';
import SectionRenderer from '@/modules/storefront/builder/components/SectionRenderer';

function getHomePage(store: Store) {
  const pages = store.builder?.pages || [];
  return pages.find((p: any) => p.slug === '/') || null;
}

export function CustomStorefront({
  store,
  products,
  onProductClick,
}: {
  store: Store;
  products: Product[];
  onProductClick: (product: Product) => void;
}) {
  const activePage = useMemo(() => getHomePage(store), [store]);
  if (!activePage) return null;

  return (
    <div>
      {activePage.sections
        .filter((s: any) => s.visible)
        .sort((a: any, b: any) => a.order - b.order)
        .map((section: any) => (
          <SectionRenderer
            key={section.id}
            section={section}
            products={products}
            globalStyles={store.builder!.globalStyles}
            isPreview={false}
            onProductClick={onProductClick}
            storeSlug={store.subdomain}
          />
        ))}
    </div>
  );
}

