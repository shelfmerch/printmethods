import React from 'react';
import type { Product, Store } from '@/types';
import EnhancedHeroSection from '@/components/storefront/EnhancedHeroSection';
import EnhancedProductsSection from '@/components/storefront/EnhancedProductsSection';
import AboutSection from '@/components/storefront/AboutSection';
import NewsletterSection from '@/components/storefront/NewsletterSection';
import { buildStorePath } from '@/utils/tenantUtils';

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

