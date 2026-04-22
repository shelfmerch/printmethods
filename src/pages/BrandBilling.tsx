import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  Zap,
  Building2,
  Globe,
  ArrowRight,
  Clock,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RAW_API_URL } from '@/config';

// ── Subscription plans ────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    employees: '50',
    regions: 'India only',
    features: [
      'Up to 50 employees',
      'India shipping only',
      'Credit allocation',
      'Brand team (2 seats)',
      'Email support',
    ],
    color: 'border-border',
    badge: null,
    icon: Zap,
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹12,999',
    period: '/month',
    employees: '250',
    regions: 'India + 1 international',
    features: [
      'Up to 250 employees',
      'India + 1 intl. region',
      'HRIS sync (Keka/Darwinbox)',
      'Campaign automation',
      'Unlimited team seats',
      'Priority support',
      'Bonusly integration',
    ],
    color: 'border-primary',
    badge: 'Most Popular',
    icon: Building2,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    employees: 'Unlimited',
    regions: 'All regions',
    features: [
      'Unlimited employees',
      'All regions (IN, TW, AU, NZ)',
      'Custom onboarding',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
      'White-label domain',
    ],
    color: 'border-border',
    badge: null,
    icon: Globe,
  },
];

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-800',
  trial:     'bg-blue-100 text-blue-800',
  expired:   'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

// ─────────────────────────────────────────────────────────────────────────────
const BrandBilling = () => {
  const { selectedStore } = useStore();
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const brandId = selectedStore?.id || (selectedStore as any)?._id;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!brandId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${RAW_API_URL}/api/stores/${brandId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStoreData(data.data || data.store);
      } catch {
        toast.error('Failed to load billing info');
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId]);

  const currentPlan = storeData?.subscriptionPlan || 'trial';
  const currentStatus = storeData?.subscriptionStatus || 'trial';
  const expiryDate = storeData?.subscriptionExpiry
    ? new Date(storeData.subscriptionExpiry).toLocaleDateString('en-IN', { dateStyle: 'medium' })
    : null;

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      // Open contact/enquiry — no self-serve for enterprise
      toast.info('Please contact us at hello@shelfmerch.in for Enterprise pricing.');
      return;
    }
    setUpgrading(planId);
    try {
      // TODO: Integrate Razorpay Subscriptions here when ready
      // For now: show a toast directing to contact
      toast.info(`Subscription upgrade to ${planId} — payment integration coming soon. Contact hello@shelfmerch.in.`);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your brand's subscription plan and billing details.
          </p>
        </div>

        {/* Current plan status */}
        {!loading && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Plan</p>
                    <p className="text-xl font-bold capitalize">{currentPlan}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus] || STATUS_COLORS.trial}`}>
                        {currentStatus}
                      </span>
                      {expiryDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Renews {expiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {currentStatus === 'expired' && (
                  <Badge variant="destructive">Subscription Expired — Upgrade to continue</Badge>
                )}
                {currentStatus === 'trial' && (
                  <Badge variant="secondary">Trial Mode — Upgrade for full access</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Choose a Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrentPlan = currentPlan === plan.id;
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${plan.color} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Icon className="h-6 w-6 text-primary" />
                      {isCurrentPlan && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-3">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Up to {plan.employees} employees · {plan.regions}
                    </CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    <ul className="space-y-2 text-sm flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-auto"
                      variant={isCurrentPlan ? 'outline' : 'default'}
                      disabled={isCurrentPlan || upgrading === plan.id}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {upgrading === plan.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.id === 'enterprise' ? (
                        <>Contact Us <ArrowRight className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>Upgrade <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact note */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground text-center">
            Need a custom quote or have billing questions?{' '}
            <a href="mailto:hello@shelfmerch.in" className="text-primary underline hover:no-underline">
              Contact hello@shelfmerch.in
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BrandBilling;
