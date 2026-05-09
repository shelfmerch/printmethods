// /**
//  * StoreRoutes Component (Storefront)
//  * Handles routing for storefront pages with support for both:
//  * - Subdomain-based routing: merch.example.com/products
//  * - Path-based routing (legacy/dev): example.com/store/merch/products
//  */

import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import { StoreAuthProvider } from '@/shared/contexts/StoreAuthContext';
import { CartProvider } from '@/shared/contexts/CartContext';
import StorefrontHomePage from '@/modules/storefront/default/pages/StorefrontHomePage';
import StoreProductsPage from '@/modules/storefront/default/pages/StoreProductsPage';
import StoreProductPage from '@/modules/storefront/default/pages/StoreProductPage';
import StoreCheckoutPage from '@/modules/storefront/default/pages/StoreCheckoutPage';
// import StoreCustomerAccountPage from '@/storefront/legacy/StoreCustomerAccountPage';
import StoreAuthPage from '@/modules/storefront/default/pages/StoreAuthPage';
import StoreProfilePage from '@/modules/storefront/default/pages/StoreProfilePage';
import StoreOrdersPage from '@/modules/storefront/default/pages/StoreOrdersPage';
import StoreSettingsPage from '@/modules/storefront/default/pages/StoreSettingsPage';
import StoreOrderDetailPage from '@/modules/storefront/default/pages/StoreOrderDetailPage';
import StoreRewardsPage from '@/modules/storefront/default/pages/StoreRewardsPage';
import { isTenantSubdomain, getTenantSlugFromLocation } from '@/shared/utils/tenantUtils';
import { StoreRewardsProvider } from '@/shared/contexts/StoreRewardsContext';

/**
 * StoreWrapper - A wrapper component to provide global state contexts
 */
const StoreWrapper = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ subdomain?: string }>();
  const location = useLocation();
  const subdomain = getTenantSlugFromLocation(location, params) || '';

  return (
    <StoreAuthProvider subdomain={subdomain}>
      <CartProvider subdomain={subdomain}>
        <StoreRewardsProvider subdomain={subdomain}>{children}</StoreRewardsProvider>
      </CartProvider>
    </StoreAuthProvider>
  );
};

export function StoreRoutes() {
  const isSubdomainMode = isTenantSubdomain();

  if (isSubdomainMode) {
    return (
      <StoreWrapper>
        <Routes>
          <Route path="/" element={<StorefrontHomePage />} />
          <Route path="/products" element={<StoreProductsPage />} />
          <Route path="/auth" element={<StoreAuthPage />} />
          {/* <Route path="/account" element={<StoreCustomerAccountPage />} /> */}
          <Route path="/product/:productId" element={<StoreProductPage />} />
          <Route path="/checkout" element={<StoreCheckoutPage />} />
          <Route path="/profile" element={<StoreProfilePage />} />
          <Route path="/orders" element={<StoreOrdersPage />} />
          <Route path="/orders/:orderId" element={<StoreOrderDetailPage />} />
          <Route path="/rewards" element={<StoreRewardsPage />} />
          <Route path="/settings" element={<StoreSettingsPage />} />
        </Routes>
      </StoreWrapper>
    );
  }

  return (
    <StoreWrapper>
      <Routes>
        {/* <Route path="/store/:subdomain" element={<StorefrontHomePage />} />
        <Route path="/store/:subdomain/products" element={<StoreProductsPage />} />
        <Route path="/store/:subdomain/auth" element={<StoreAuthPage />} /> */}
        {/* <Route path="/store/:subdomain/account" element={<StoreCustomerAccountPage />} /> */}
        {/* <Route path="/store/:subdomain/product/:productId" element={<StoreProductPage />} />
        <Route path="/store/:subdomain/checkout" element={<StoreCheckoutPage />} />
        <Route path="/store/:subdomain/profile" element={<StoreProfilePage />} />
        <Route path="/store/:subdomain/orders" element={<StoreOrdersPage />} />
        <Route path="/store/:subdomain/orders/:orderId" element={<StoreOrderDetailPage />} />
        <Route path="/store/:subdomain/settings" element={<StoreSettingsPage />} /> */}
        <Route path=":subdomain" element={<StorefrontHomePage />} />
        <Route path=":subdomain/products" element={<StoreProductsPage />} />
        <Route path=":subdomain/auth" element={<StoreAuthPage />} />
        {/* <Route path=":subdomain/account" element={<StoreCustomerAccountPage />} /> */}
        <Route path=":subdomain/product/:productId" element={<StoreProductPage />} />
        <Route path=":subdomain/checkout" element={<StoreCheckoutPage />} />
        <Route path=":subdomain/profile" element={<StoreProfilePage />} />
        <Route path=":subdomain/orders" element={<StoreOrdersPage />} />
        <Route path=":subdomain/orders/:orderId" element={<StoreOrderDetailPage />} />
        <Route path=":subdomain/rewards" element={<StoreRewardsPage />} />
        <Route path=":subdomain/settings" element={<StoreSettingsPage />} />
      </Routes>
    </StoreWrapper>
  );
}

export default StoreRoutes;

/**
 * StoreRoutes Component (Storefront)
 * Handles routing for storefront pages with support for both:
 * - Subdomain-based routing: merch.example.com/products
 * - Path-based routing (legacy/dev): example.com/store/merch/products
 */

