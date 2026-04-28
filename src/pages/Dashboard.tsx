import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStore } from '@/contexts/StoreContext';
import { brandDashboardApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Package,
  PackageOpen,
  Plus,
  Printer,
  Store,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

const formatMoney = (value: unknown) => {
  const numeric = Number(value || 0);
  return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatLimit = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Unlimited';
  return String(value);
};

const Dashboard = () => {
  const { selectedStore, stores, loading: storesLoading } = useStore();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const brandId = selectedStore?.id || selectedStore?._id;

    if (!brandId) {
      setSummary(null);
      return;
    }

    const loadSummary = async () => {
      try {
        setLoading(true);
        const data = await brandDashboardApi.getSummary(brandId);
        if (isMounted) setSummary(data);
      } catch (error) {
        console.error('Failed to load brand dashboard summary', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [selectedStore]);

  const storeName = summary?.store?.name || selectedStore?.brandProfile?.companyName || selectedStore?.storeName || 'Your swag store';
  const hasStore = Boolean(selectedStore);

  const onboardingSteps = useMemo(() => [
    {
      title: 'Create swag store',
      description: 'Your company storefront is ready.',
      complete: Boolean(summary?.onboarding?.storeCreated || selectedStore),
      to: '/create-store',
      icon: Store,
    },
    {
      title: 'Design first product',
      description: 'Add your first branded item.',
      complete: Boolean(summary?.onboarding?.firstProductDesigned),
      to: '/products',
      icon: Package,
    },
    {
      title: 'Add team members',
      description: 'Invite HR, finance, or marketing.',
      complete: Boolean(summary?.onboarding?.teamMembersAdded),
      to: '/brand/team',
      icon: Users,
    },
    {
      title: 'Top up wallet',
      description: 'Fund credits and fulfillment.',
      complete: Boolean(summary?.onboarding?.walletToppedUp),
      to: '/wallet/top-up',
      icon: Wallet,
    },
    {
      title: 'Create first kit',
      description: 'Build an onboarding or event kit.',
      complete: Boolean(summary?.onboarding?.firstKitCreated),
      to: '/brand/kits',
      icon: Gift,
    },
  ], [selectedStore, summary]);

  const completedSteps = onboardingSteps.filter((step) => step.complete).length;

  const pipeline = [
    { label: 'In production', value: summary?.orders?.inProduction ?? 0, icon: Package },
    { label: 'Printing', value: summary?.orders?.printing ?? 0, icon: Printer },
    { label: 'Packaging', value: summary?.orders?.packaging ?? 0, icon: PackageOpen },
    { label: 'Shipped', value: summary?.orders?.shipped ?? 0, icon: Truck },
  ];

  if (!hasStore && !storesLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl py-16">
          <Card className="p-10 text-center">
            <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Create your first swag store</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Your dashboard will show products, production, wallet balance, team setup, and onboarding progress once a store exists.
            </p>
            <Button className="mt-6" onClick={() => navigate(stores.length ? '/stores' : '/create-store')}>
              <Plus className="mr-2 h-4 w-4" />
              Create swag store
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{storeName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A simple home view for setup, wallet, products, and production progress.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/products')}>
              <Plus className="mr-2 h-4 w-4" />
              Design product
            </Button>
            <Button onClick={() => navigate('/brand/kits')}>
              Create kit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Plan</p>
            {loading || storesLoading ? (
              <Skeleton className="mt-3 h-8 w-32" />
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl font-semibold">{summary?.plan?.name || 'Free'}</span>
                <Badge variant="outline">{summary?.plan?.serviceFeePercent ?? 15}% service fee</Badge>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Company wallet</p>
            {loading || storesLoading ? (
              <Skeleton className="mt-3 h-8 w-32" />
            ) : (
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-2xl font-semibold">{formatMoney(summary?.wallet?.balanceRupees)}</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/wallet/top-up')}>Top up</Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Team and employees</p>
            {loading || storesLoading ? (
              <Skeleton className="mt-3 h-8 w-40" />
            ) : (
              <div className="mt-3">
                <p className="text-2xl font-semibold">
                  {summary?.team?.total ?? 0} team / {summary?.employees?.total ?? 0} employees
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Employee limit: {formatLimit(summary?.plan?.maxEmployees)}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Getting started</h2>
                <p className="text-sm text-muted-foreground">{completedSteps}/5 steps complete</p>
              </div>
              <Badge className={completedSteps === 5 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                {completedSteps === 5 ? 'Ready' : 'In setup'}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              {onboardingSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => navigate(step.to)}
                    className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full ${step.complete ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{step.title}</span>
                      <span className="block text-sm text-muted-foreground">{step.description}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Product health</h2>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="mt-2 text-2xl font-semibold">{summary?.products?.total ?? 0}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Live</p>
                  <p className="mt-2 text-2xl font-semibold">{summary?.products?.live ?? 0}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="mt-2 text-2xl font-semibold">{summary?.products?.draft ?? 0}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Free plan allows {formatLimit(summary?.plan?.maxActiveProducts ?? 10)} live products.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Production</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>Orders</Button>
              </div>
              <div className="mt-5 space-y-3">
                {pipeline.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-lg font-semibold">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
