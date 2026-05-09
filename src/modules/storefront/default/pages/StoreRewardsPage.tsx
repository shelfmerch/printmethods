import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import StoreLayout from '@/modules/storefront/shared/components/StoreLayout';
import { useStoreRewards } from '@/shared/contexts/StoreRewardsContext';
import { useStoreAuth } from '@/shared/contexts/StoreAuthContext';
import { buildStorePath, getTenantSlugFromLocation } from '@/shared/utils/tenantUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Gift, Wallet, ArrowLeft, Loader2, CheckCircle2, Clock } from 'lucide-react';

const formatRupees = (paise: number) =>
  `₹${((Number(paise) || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StoreRewardsPage: React.FC = () => {
  const params = useParams<{ subdomain?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const subdomain = getTenantSlugFromLocation(location, params) || params.subdomain || '';

  const { isAuthenticated, isLoading: authLoading } = useStoreAuth();
  const { wallet, rewards, loading } = useStoreRewards();

  const balancePaise = wallet?.remainingBalancePaise || 0;
  const pendingClaimablePaise = wallet?.pendingClaimablePaise || 0;

  const sortedRewards = useMemo(() => [...rewards], [rewards]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <StoreLayout>
        <main className="container mx-auto max-w-3xl px-4 py-10">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center">
                <Gift className="h-6 w-6 text-green-700" />
              </div>
              <h1 className="text-2xl font-bold">Rewards</h1>
              <p className="text-muted-foreground mt-1">Login to view and claim your rewards for this store.</p>
              <Button className="mt-6" onClick={() => navigate(buildStorePath('/auth', subdomain) + '?redirect=rewards')}>
                Login / Sign Up
              </Button>
            </CardContent>
          </Card>
        </main>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <Link
            to={buildStorePath('/', subdomain)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to store
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-green-50 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
              <p className="text-muted-foreground text-sm">Corporate reward credits for this store (separate from promo codes).</p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <Card className="border border-green-100 bg-green-50/50 rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Your reward balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="text-3xl font-bold text-green-800">{formatRupees(balancePaise)}</div>
                {pendingClaimablePaise > 0 && (
                  <p className="text-sm text-green-800/80 mt-1">
                    {formatRupees(pendingClaimablePaise)} available to claim
                  </p>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Earned rewards can be applied on product subtotal at checkout.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Rewards history</h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <Separator className="my-4" />

          {sortedRewards.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-10 text-center">
                <Gift className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold">No rewards yet</p>
                <p className="text-sm text-muted-foreground mt-1">When your organization assigns rewards, you’ll see them here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedRewards.map((r) => {
                const isCredited = r.status === 'claimed';
                const isUsed = r.status === 'used';

                return (
                  <Card key={r.id} className="rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-lg truncate">{r.title}</p>
                            <Badge variant="secondary" className="rounded-full">
                              {r.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatRupees(r.amountPaise)} credits
                            {r.claimedAt ? (
                              <span className="ml-2 inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Credited {new Date(r.claimedAt).toLocaleDateString('en-IN')}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {isCredited && (
                            <span className="text-sm text-green-700 inline-flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Credited to your wallet
                            </span>
                          )}
                          {isUsed && (
                            <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Used
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </StoreLayout>
  );
};

export default StoreRewardsPage;

