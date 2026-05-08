import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { StoreAuthProvider } from "@/shared/contexts/StoreAuthContext";
import { StoreProvider } from "@/shared/contexts/StoreContext";
import { DataProvider } from "@/shared/contexts/DataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/Index";
import Products from "@/modules/public/pages/Products";
import AllCategories from "@/modules/public/pages/AllCategories";
import CategoryProducts from "@/modules/public/pages/CategoryProducts";
import CategorySubcategories from "@/modules/public/pages/Apparel";
import ProductDetail from "@/modules/public/pages/ProductDetail";
import DesignerEditor from "@/modules/design-editor/DesignEditorPage";
import Auth from "@/modules/public/pages/Auth";
import VerifyEmail from "@/modules/public/pages/VerifyEmail";
import VerifyPhone from "@/modules/public/pages/VerifyPhone";
import Dashboard from "@/modules/merchant/pages/Dashboard";
import ProfilePage from "@/modules/merchant/pages/ProfilePage";
import Orders from "@/modules/merchant/pages/Orders";
import MerchantOrderDetail from "@/modules/merchant/pages/MerchantOrderDetail";
import Stores from "@/modules/merchant/pages/Stores";
import ConnectStore from "@/modules/merchant/pages/ConnectStore";
import Analytics from "@/modules/merchant/pages/Analytics";
import Settings from "@/modules/merchant/pages/Settings";
import DeveloperDashboard from "@/modules/merchant/pages/DeveloperDashboard";
import PersonalAccessTokensPage from "@/modules/merchant/pages/PersonalAccessTokens";
import Customers from "@/modules/merchant/pages/Customers";
import Admin from '@/modules/admin/pages/Admin';
import AdminOrderDetail from '@/modules/admin/pages/AdminOrderDetail';
import AdminProductCreation from "@/modules/admin/pages/AdminProductCreation";
import AdminProductDetail from "@/modules/admin/pages/AdminProductDetail";
import ManageVariantOptions from "@/modules/admin/pages/ManageVariantOptions";
import ManageCatalogueFields from "@/modules/admin/components/ManageCatalogueFields";
import AdminAssets from "@/modules/admin/pages/AdminAssets";
import CreateStore from "@/modules/merchant/pages/CreateStore";
// Storefront routes are handled by `StoreRoutes`.
// import StoreCustomerAccountPage from "./storefront/legacy/StoreCustomerAccountPage";
import OrderConfirmation from "@/modules/public/pages/OrderConfirmation";
import BuilderDemo from "@/modules/storefront/builder/pages/BuilderDemo";
import NotFound from "@/modules/public/pages/NotFound";
import ProductCreation from "@/modules/merchant/pages/ProductCreation";
import ListingEditor from "@/modules/merchant/pages/ListingEditor";
// Storefront auth is routed via `StoreRoutes` (storefront module).
import StoreRoutes from "@/components/StoreRoutes";
import { isTenantSubdomain } from "@/shared/utils/tenantUtils";
import MockupsLibrary from "@/modules/merchant/pages/MockupsLibrary";
import PopupStores from "@/modules/merchant/pages/PopupStores";
import MerchantInvoices from "@/modules/merchant/pages/MerchantInvoices";
import AdminInvoices from "@/modules/admin/pages/AdminInvoices";
import { WalletTopUp, WalletTransactions, MerchantWallet } from "@/modules/wallet/pages";
import CatalogBrowse from "@/modules/public/pages/CatalogBrowse";
import CatalogOrderPage from "@/modules/public/pages/CatalogOrderPage";
import DirectCheckout from "@/modules/public/pages/DirectCheckout";
import BrandKits from "@/modules/merchant/pages/BrandKits";
import BrandKitBuilder from "@/modules/merchant/pages/BrandKitBuilder";
import BrandKitDetail from "@/modules/merchant/pages/BrandKitDetail";
import BrandKitSendWizard from "@/modules/merchant/pages/BrandKitSendWizard";
import KitRedeem from "@/modules/public/pages/KitRedeem";
import BrandDraftOrders from "@/modules/merchant/pages/BrandDraftOrders";
import BrandSupportTickets from "@/modules/merchant/pages/BrandSupportTickets";
import BrandTeam from "@/modules/merchant/pages/BrandTeam";
import BrandEmployees from "@/modules/merchant/pages/BrandEmployees";
import CreditAllocation from "@/modules/merchant/pages/CreditAllocation";
import BrandBilling from "@/modules/merchant/pages/BrandBilling";
import AdminWithdrawals from "@/modules/admin/pages/AdminWithdrawals";
import PrintMethods from "@/modules/admin/components/PrintMethods";
import SponsorWidgetPage from "@/modules/public/pages/SponsorWidgetPage";
import ShopifyDashboard from "@/modules/merchant/pages/ShopifyDashboard";
import ShopifyProducts from "@/modules/merchant/pages/ShopifyProducts";
import ShopifyApp from "@/modules/merchant/pages/ShopifyApp";

import PricingPage from "@/modules/public/rem-pgs/PricingPage";
import PlatformPage from "@/modules/public/pages/PlatformPage";
import CreatorAgenciesPage from "@/modules/public/rem-pgs/solutions/CreatorAgenciesPage";
import FashionApparelPage from "@/modules/public/rem-pgs/solutions/FashionApparelPage";
import EntertainmentMediaPage from "@/modules/public/rem-pgs/solutions/EntertainmentMediaPage";
import HomeDecorPage from "@/modules/public/rem-pgs/solutions/HomeDecorPage";
import CustomizedMerchPage from "@/modules/public/rem-pgs/solutions/CustomizedMerchPage";
import EnterpriseMerchPage from "@/modules/public/rem-pgs/solutions/EnterpriseMerchPage";
import BulkOrdersPage from "@/modules/public/rem-pgs/solutions/BulkOrdersPage";
import OurStoryPage from "@/modules/public/rem-pgs/about/OurStoryPage";
import CareersPage from "@/modules/public/rem-pgs/about/CareersPage";
import HelpCenterPage from "@/modules/public/rem-pgs/support/HelpCenterPage";
import PoliciesPage from "@/modules/public/rem-pgs/support/PoliciesPage";
import CurrentProductionShippingTimesPage from "@/modules/public/rem-pgs/support/CurrentProductionShippingTimesPage";
import CustomerSupportPolicyPage from "@/modules/public/rem-pgs/support/CustomerSupportPolicyPage";
import ContentGuidelinesPage from "@/modules/public/rem-pgs/support/ContentGuidelinesPage";
import ContactUsPage from "@/modules/public/rem-pgs/support/ContactUsPage";
import PrivacyPolicy from "@/modules/public/pages/PrivacyPolicy";
import DataDeletionPolicy from "@/modules/public/pages/DataDeletionPolicy";
import TermsOfConditions from "@/modules/public/pages/TermsOfConditions";

//DEVELOPERS
import Causes from "@/modules/public/pages/Causes";
import { ScrollToTop } from "@/shared/components/common/ScrollToTop";

// Root route component that conditionally renders Index or StoreRoutes
// On subdomains, StoreRoutes handles all routing including root path
const RootRoute = () => {
  if (isTenantSubdomain()) {
    return <StoreRoutes />;
  }
  return <Index />;
};

const queryClient = new QueryClient();


const App = () => {
  const tenantMode = isTenantSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen w-full overflow-x-hidden">
            <AuthProvider>
              <StoreProvider>
                <DataProvider>
                  <Routes>
                    <Route
                      path="/shopify/app"
                      element={<ShopifyApp />}
                    />
                    {/* Tenant subdomain: ONLY storefront routes */}
                    {tenantMode ? (
                      <Route path="/*" element={<StoreRoutes />} />
                    ) : (
                      <>
                        {/* Root route: Conditionally shows Index or StoreRoutes based on subdomain */}
                        <Route path="/" element={<RootRoute />} />
                        {/* Main site routes */}
                        <Route path="/causes" element={<Causes />} />
                        <Route path="/platform" element={<PlatformPage />} />
                        <Route path="/products" element={<Products />} />
                        {/* Storefront routes (subdomain or /store/:subdomain) are handled by StoreRoutes via RootRoute. */}
                        <Route path="/categories" element={<AllCategories />} />
                        <Route path="/category-subcategories/:categoryId" element={<CategorySubcategories />} />
                        <Route path="/products/category/:slug" element={<CategoryProducts />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/catalog" element={<CatalogBrowse />} />
                        <Route path="/catalog/:productId" element={<CatalogOrderPage />} />
                        <Route path="/direct-checkout" element={<DirectCheckout />} />
                        <Route path="/redeem/:token" element={<KitRedeem />} />
                        {/* Auth for storefront is handled by StoreRoutes via RootRoute. */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/verify-phone" element={<VerifyPhone />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/solutions/creators-agencies" element={<CreatorAgenciesPage />} />
                        <Route path="/solutions/fashion-apparel" element={<FashionApparelPage />} />
                        <Route path="/solutions/entertainment-media" element={<EntertainmentMediaPage />} />
                        <Route path="/solutions/home-decor" element={<HomeDecorPage />} />
                        <Route path="/solutions/customized-merch" element={<CustomizedMerchPage />} />
                        <Route path="/solutions/enterprise-merch" element={<EnterpriseMerchPage />} />
                        <Route path="/solutions/bulk-orders" element={<BulkOrdersPage />} />
                        <Route path="/about/our-story" element={<OurStoryPage />} />
                        <Route path="/about/careers" element={<CareersPage />} />
                        <Route path="/support/help-center" element={<HelpCenterPage />} />
                        <Route path="/support/policies" element={<PoliciesPage />} />
                        <Route path="/support/production-shipping-times" element={<CurrentProductionShippingTimesPage />} />
                        <Route path="/support/customer-support-policy" element={<CustomerSupportPolicyPage />} />
                        <Route path="/support/content-guidelines" element={<ContentGuidelinesPage />} />
                        <Route path="/support/contact-us" element={<ContactUsPage />} />
                        <Route path="/terms-of-conditions" element={<TermsOfConditions />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/data-deletion-policy" element={<DataDeletionPolicy />} />
                        <Route
                          path="/designer/:id"
                          element={<DesignerEditor />}
                        />
                        <Route
                          path="/sponsor-widget"
                          element={<SponsorWidgetPage />}
                        />
                        <Route
                          path="/listing-editor/:id"
                          element={
                            <ProtectedRoute>
                              <ListingEditor />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/products/:productId"
                      element={
                        <ProtectedRoute>
                          <ProductCreation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/listing-editor"
                      element={
                        <ProtectedRoute>
                          <ListingEditor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mockups-library"
                      element={
                        <ProtectedRoute>
                          <MockupsLibrary />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <ProtectedRoute>
                          <MerchantOrderDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/direct/:id"
                      element={
                        <ProtectedRoute>
                          <MerchantOrderDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/stores"
                      element={
                        <ProtectedRoute>
                          <Stores />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/connect-store"
                      element={
                        <ProtectedRoute>
                          <ConnectStore />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wallet/top-up"
                      element={
                        <ProtectedRoute>
                          <WalletTopUp />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wallet/transactions"
                      element={
                        <ProtectedRoute>
                          <WalletTransactions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/popup-stores"
                      element={
                        <ProtectedRoute>
                          <PopupStores />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices"
                      element={
                        <ProtectedRoute>
                          <MerchantInvoices />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/stores/:storeId/builder"
                      element={
                        <ProtectedRoute>
                          <BuilderDemo />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customers"
                      element={
                        <ProtectedRoute>
                          <Customers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings/developer"
                      element={
                        <ProtectedRoute>
                          <DeveloperDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings/developer/tokens"
                      element={
                        <ProtectedRoute>
                          <PersonalAccessTokensPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/quotations"
                      element={
                        <ProtectedRoute requireAdmin>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/support-tickets"
                      element={
                        <ProtectedRoute requireAdmin>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/shopify"
                      element={
                        <ProtectedRoute>
                          <ShopifyDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/shopify/:shop/products"
                      element={
                        <ProtectedRoute>
                          <ShopifyProducts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders/:id"
                      element={
                        // <ProtectedRoute requireAdmin>
                        <AdminOrderDetail />
                        // </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/new"
                      element={
                        // <ProtectedRoute >

                        <AdminProductCreation />
                        // </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/:id/edit"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminProductCreation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/:id"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminProductDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/print-methods"
                      element={
                        <ProtectedRoute requireAdmin>
                          <PrintMethods />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/variant-options"
                      element={
                        <ProtectedRoute requireAdmin>
                          <ManageVariantOptions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/catalogue-fields"
                      element={
                        <ProtectedRoute requireAdmin>
                          <ManageCatalogueFields />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/invoices"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminInvoices />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/assets"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminAssets />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wallet"
                      element={
                        <ProtectedRoute>
                          <MerchantWallet />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/team"
                      element={
                        <ProtectedRoute>
                          <BrandTeam />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/employees"
                      element={
                        <ProtectedRoute>
                          <BrandEmployees />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/credits"
                      element={
                        <ProtectedRoute>
                          <CreditAllocation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/billing"
                      element={
                        <ProtectedRoute>
                          <BrandBilling />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/draft-orders"
                      element={
                        <ProtectedRoute>
                          <BrandDraftOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/support-tickets"
                      element={
                        <ProtectedRoute>
                          <BrandSupportTickets />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/kits"
                      element={
                        <ProtectedRoute>
                          <BrandKits />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/kits/new"
                      element={
                        <ProtectedRoute>
                          <BrandKitBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/kits/:id"
                      element={
                        <ProtectedRoute>
                          <BrandKitDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/kits/:id/edit"
                      element={
                        <ProtectedRoute>
                          <BrandKitBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/brand/kits/:id/send"
                      element={
                        <ProtectedRoute>
                          <BrandKitSendWizard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/withdrawals"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminWithdrawals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-store"
                      element={
                        <ProtectedRoute>
                          <CreateStore />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="*" element={<NotFound />} />
                      </>
                    )}
                  </Routes>
                </DataProvider>
              </StoreProvider>
            </AuthProvider>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
