import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package2, Send, Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Header, Footer } from '@/components/home/';
import { useStore } from '@/contexts/StoreContext';
import { kitsApi } from '@/lib/kits';
import { Kit } from '@/types/kits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusTone: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800',
  live: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-100 text-slate-800',
};

const BrandKits = () => {
  const { selectedStore } = useStore();
  const brandId = selectedStore?.id || (selectedStore as any)?._id;
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!brandId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response: any = await kitsApi.list(brandId);
        setKits(response.data || []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load kits');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [brandId]);

  const totals = useMemo(() => ({
    total: kits.length,
    live: kits.filter((kit) => kit.status === 'live').length,
    drafts: kits.filter((kit) => kit.status === 'draft').length,
  }), [kits]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardLayout>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Kits &amp; Items</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Package your catalog products into reusable gift kits, then send them at scale.
              </p>
            </div>
            <Button asChild>
              <Link to="/brand/kits/new">
                <Plus className="mr-2 h-4 w-4" />
                Create a Kit
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total kits</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{totals.total}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Live kits</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{totals.live}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{totals.drafts}</CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {kits.map((kit) => (
              <Link key={kit._id} to={`/brand/kits/${kit._id}`} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">{kit.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {kit.items.length} item{kit.items.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <Badge className={statusTone[kit.status] || statusTone.draft}>{kit.status}</Badge>
                    </div>
                    <div className="grid gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Package2 className="h-4 w-4" />
                        {kit.items.length} products configured
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        Last sent {kit.lastSentAt ? new Date(kit.lastSentAt).toLocaleDateString() : 'Not yet'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                      <span>Open details</span>
                      <Send className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {!loading && kits.length === 0 && (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <Package2 className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h2 className="text-lg font-semibold">No kits yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start by creating a reusable kit of products and branded logos.
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/brand/kits/new">Create your first kit</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
      <Footer />
    </div>
  );
};

export default BrandKits;
