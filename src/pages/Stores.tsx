import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { storeProductsApi } from '@/lib/api';
import { getStoreUrl } from '@/utils/storeUrl';
import {
  ArrowRight,
  Code2,
  ExternalLink,
  Paintbrush,
  Package,
  Plus,
  ShoppingBag,
  Store as StoreIcon,
} from 'lucide-react';

const Stores = () => {
  const { stores, selectedStore, loading, refreshStores } = useStore();
  const navigate = useNavigate();
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    refreshStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      const storesToFetch = stores.filter((store) => {
        const storeId = store.id || store._id;
        return storeId && productCounts[storeId] === undefined && store.productsCount === undefined;
      });

      for (const store of storesToFetch) {
        const storeId = store.id || store._id;
        if (!storeId) continue;
        try {
          const response = await storeProductsApi.list({ storeId });
          if (response.success) {
            setProductCounts((prev) => ({ ...prev, [storeId]: response.data?.length || 0 }));
          }
        } catch (error) {
          console.error(`Failed to fetch product count for store ${storeId}`, error);
        }
      }
    };

    if (stores.length) loadCounts();
  }, [stores, productCounts]);

  const activeStore = selectedStore || stores[0] || null;
  const activeStoreId = activeStore?.id || activeStore?._id;
  const productCount = useMemo(() => {
    if (!activeStore) return 0;
    return activeStore.productsCount ?? (activeStoreId ? productCounts[activeStoreId] : 0) ?? 0;
  }, [activeStore, activeStoreId, productCounts]);

  const storeUrl = activeStore?.subdomain ? getStoreUrl(activeStore.subdomain) : null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Store Setup</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Channels and integrations</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Choose how your company uses ShelfMerch: our hosted swag store, Shopify, or API.
            </p>
          </div>
          {!loading && !activeStore && (
            <Button onClick={() => navigate('/create-store')}>
              <Plus className="mr-2 h-4 w-4" />
              Create swag store
            </Button>
          )}
        </div>

        <div className="grid gap-5">
          <Card className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-green-50 text-green-700">
                  <StoreIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">ShelfMerch hosted swag store</h2>
                    <Badge variant={activeStore ? 'default' : 'secondary'}>
                      {activeStore ? 'Active' : 'Not created'}
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    A branded swag storefront hosted by ShelfMerch for employees, kits, campaigns, and company gifting.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Store: <span className="font-medium text-foreground">{activeStore?.storeName || 'Not set up'}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Products: <span className="font-medium text-foreground">{loading ? '...' : productCount}</span>
                    </span>
                    {activeStore?.subdomain && (
                      <span className="text-muted-foreground">
                        URL: <span className="font-medium text-foreground">{activeStore.subdomain}.shelfmerch.com</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {loading ? (
                  <Skeleton className="h-10 w-48" />
                ) : activeStore ? (
                  <>
                    {storeUrl && (
                      <Button variant="outline" onClick={() => window.open(storeUrl, '_blank', 'noopener,noreferrer')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit store
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate(`/stores/${activeStoreId}/builder`)}>
                      <Paintbrush className="mr-2 h-4 w-4" />
                      Customize
                    </Button>
                    <Button onClick={() => navigate('/products')}>
                      <Package className="mr-2 h-4 w-4" />
                      Add products
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/create-store')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create swag store
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">Shopify store</h2>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Connect an existing Shopify store if your team already sells or manages products there.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/dashboard/shopify')}>
                Connect Shopify
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">API docs</h2>
                    <Badge variant="outline">For custom builds</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Use the API for a custom storefront, internal portal, ERP workflow, or deeper automation.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate('/settings/developer')}>
                  Developer settings
                </Button>
                <Button onClick={() => window.open('/api/v1/docs', '_blank', 'noopener,noreferrer')}>
                  View API docs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Stores;
