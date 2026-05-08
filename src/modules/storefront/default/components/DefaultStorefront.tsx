import React from 'react';
import type { Product, Store } from '@/shared/types';
import EnhancedHeroSection from '@/modules/storefront/shared/components/EnhancedHeroSection';
import EnhancedProductsSection from '@/modules/storefront/shared/components/EnhancedProductsSection';
import AboutSection from '@/modules/storefront/shared/components/AboutSection';
import NewsletterSection from '@/modules/storefront/shared/components/NewsletterSection';
import { buildStorePath } from '@/shared/utils/tenantUtils';

export function DefaultStorefront({
  store,
  products,
  onProductClick,
}: {
  store: Store;
  products: Product[];
  onProductClick: (product: Product) => void;
}) {
  return (
    <>
      <EnhancedHeroSection storeName={store.storeName} description={store.description} />

      <EnhancedProductsSection
        products={products.slice(0, 8)}
        onProductClick={onProductClick}
        onAddToCart={(product) => onProductClick(product)}
        showViewAllButton={products.length > 8}
        viewAllLink={buildStorePath('/products', store.subdomain)}
        title="Featured Products"
        subtitle="Featured Collection"
      />

      <AboutSection storeName={store.storeName} description={store.description} />
      <NewsletterSection />
    </>
  );
}

