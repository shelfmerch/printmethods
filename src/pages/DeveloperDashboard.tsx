import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  developerShopsApi, developerPatApi,
  type Shop, type PersonalAccessToken, type CreatePatResponse,
} from '@/lib/api';
import { apiRequest } from '@/lib/api';
import CreateTokenModal from '@/components/developer/CreateTokenModal';
import TokenRevealModal from '@/components/developer/TokenRevealModal';
import TokenList from '@/components/developer/TokenList';

// ─── Tab types ──────────────────────────────────────────────────────────────
type Tab = 'shops' | 'apikeys' | 'webhooks' | 'limits';

// ─── Currency helpers ────────────────────────────────────────────────────────
const CURRENCIES = ['INR', 'USD', 'GBP', 'EUR', 'AED', 'SGD'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'UAE', 'Singapore'];

// ─── Components ─────────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Shops Tab ───────────────────────────────────────────────────────────────
function ShopsTab() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', currency: 'INR', country: 'India' });
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await developerShopsApi.list();
      setShops(list);
    } catch {
      // If PAT not set, shops list will be empty — that's fine
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Shop name is required'); return; }
    try {
      setCreating(true);
      await developerShopsApi.create(form);
      toast.success(`Shop "${form.name}" created`);
      setShowForm(false);
      setForm({ name: '', currency: 'INR', country: 'India' });
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create shop');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Shops</h2>
          <p className="text-sm text-muted-foreground">
            Every product must belong to a shop. Account → Shop → Product → Order.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/stores')}>
            Manage in Dashboard
          </Button>
          <Button size="sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ New Shop'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Shop Name *</Label>
                <Input
                  placeholder="Demo Store"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Currency</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Shop'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading shops…</p>
          ) : shops.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No shops yet.</p>
              <p className="text-xs text-muted-foreground">
                Create a shop to start listing products via the API or the dashboard.
              </p>
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                Create your first shop
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {shops.map(shop => (
                <div key={shop.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {shop.slug} · {shop.currency} · {shop.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                      {shop.status || (shop.is_active ? 'active' : 'inactive')}
                    </Badge>
                    <code className="text-[10px] text-muted-foreground font-mono">{String(shop.id).slice(-8)}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-xs font-mono text-muted-foreground">
            <span className="text-foreground font-semibold">API usage:</span>{' '}
            <code>POST /api/v1/shops/:shopId/products</code> — always include shopId in the URL path.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── API Keys Tab ────────────────────────────────────────────────────────────
function ApiKeysTab() {
  const [tokens, setTokens] = useState<PersonalAccessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [tokenBeingRevoked, setTokenBeingRevoked] = useState<PersonalAccessToken | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await developerPatApi.list();
      setTokens(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: { name: string; scopes: string[] }) => {
    try {
      const result: CreatePatResponse = await developerPatApi.create(payload);
      setTokens(prev => [{
        id: result.id, name: result.name, keyPrefix: result.keyPrefix,
        scopes: result.scopes, type: 'personal_access_token',
        planCode: 'unknown', createdAt: result.createdAt,
      }, ...prev]);
      // Store PAT for shop API calls
      if (result.key) localStorage.setItem('sm_pat', result.key);
      setNewTokenValue(result.key);
      setRevealOpen(true);
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create token');
    }
  };

  const handleRevoke = async () => {
    if (!tokenBeingRevoked) return;
    try {
      setRevoking(true);
      await developerPatApi.revoke(tokenBeingRevoked.id);
      setTokens(prev => prev.filter(t => t.id !== tokenBeingRevoked.id));
      toast.success('Token revoked');
      setTokenBeingRevoked(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke token');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Personal Access Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Use tokens to authenticate API calls. Tokens are shown once — store them securely.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Generate Token</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading tokens…</p>
          ) : (
            <TokenList tokens={tokens} onRevoke={t => setTokenBeingRevoked(t)} />
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-4 space-y-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">HTTP header:</span>{' '}
            <code className="font-mono">X-API-Key: sm_pat_...</code>
          </p>
          <Button
            variant="link" className="h-auto p-0 text-xs"
            onClick={() => window.open('/api/v1/docs', '_blank', 'noopener,noreferrer')}
          >
            View full API documentation →
          </Button>
        </CardContent>
      </Card>

      <CreateTokenModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      <TokenRevealModal open={revealOpen} tokenValue={newTokenValue} onClose={() => { setRevealOpen(false); setNewTokenValue(null); }} />

      <AlertDialog open={!!tokenBeingRevoked} onOpenChange={open => { if (!open) setTokenBeingRevoked(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke token</AlertDialogTitle>
            <AlertDialogDescription>
              Revoke <span className="font-semibold text-foreground">{tokenBeingRevoked?.name}</span>?
              Any integrations using this token will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRevoke} disabled={revoking}
            >
              {revoking ? 'Revoking…' : 'Yes, revoke'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Webhooks Tab ─────────────────────────────────────────────────────────────
function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ url: '', events: 'product.published,order.created' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    apiRequest<any[]>('/webhooks')
      .then(data => setWebhooks(Array.isArray(data) ? data : (data as any)?.data ?? []))
      .catch(() => setWebhooks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) { toast.error('URL is required'); return; }
    try {
      setSaving(true);
      const created = await apiRequest<any>('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          url: form.url,
          events: form.events.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      setWebhooks(prev => [created, ...prev]);
      setForm({ url: '', events: 'product.published,order.created' });
      setShowForm(false);
      toast.success('Webhook registered');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register webhook');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/webhooks/${id}`, { method: 'DELETE' });
      setWebhooks(prev => prev.filter(w => w.id !== id && w._id !== id));
      toast.success('Webhook removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove webhook');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <p className="text-sm text-muted-foreground">
            Receive real-time events when products publish, orders are created, or orders update.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Register Webhook'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Endpoint URL *</Label>
                <Input
                  placeholder="https://yourapp.com/webhooks/shelfmerch"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Events (comma-separated)</Label>
                <Input
                  value={form.events}
                  onChange={e => setForm(f => ({ ...f, events: e.target.value }))}
                  placeholder="product.published,order.created,order.updated"
                />
                <p className="text-xs text-muted-foreground">
                  Available: product.published, product.updated, order.created, order.updated, order.fulfilled
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving…' : 'Register'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading webhooks…</p>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No webhooks registered.</p>
          ) : (
            <div className="divide-y">
              {webhooks.map(wh => (
                <div key={wh.id || wh._id} className="flex items-start justify-between py-3 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs break-all">{wh.url}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(wh.events || []).map((ev: string) => (
                        <Badge key={ev} variant="outline" className="text-[10px]">{ev}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDelete(wh.id || wh._id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Rate Limits Tab ──────────────────────────────────────────────────────────
interface RateLimitData {
  credential_type: string;
  plan: string;
  rate_limit_rpm: number;
  stores: any[];
}

function RateLimitsTab() {
  const [data, setData] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<RateLimitData>('/auth/me')
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const planBadgeColor: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    starter: 'bg-blue-100 text-blue-700',
    business: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Rate Limits & Plan</h2>
        <p className="text-sm text-muted-foreground">
          Your current plan's API limits and usage context.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-20 rounded bg-muted animate-pulse" />
            ) : (
              <span className={`inline-block text-sm font-semibold px-2 py-1 rounded capitalize ${
                planBadgeColor[data?.plan || 'free'] || planBadgeColor.free
              }`}>
                {data?.plan || '—'}
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Requests / min</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            ) : (
              <p className="text-2xl font-bold tabular-nums">{data?.rate_limit_rpm ?? '—'}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Shops</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            ) : (
              <p className="text-2xl font-bold tabular-nums">{data?.stores?.length ?? 0}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Plan Limits Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-2 text-muted-foreground font-medium">Plan</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">RPM</th>
                <th className="text-right pb-2 text-muted-foreground font-medium">Monthly Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { plan: 'Free', rpm: 60, monthly: '10,000' },
                { plan: 'Starter', rpm: 300, monthly: '100,000' },
                { plan: 'Business', rpm: 1200, monthly: '1,000,000' },
                { plan: 'Enterprise', rpm: 5000, monthly: 'Unlimited' },
              ].map(row => (
                <tr key={row.plan} className={`${data?.plan?.toLowerCase() === row.plan.toLowerCase() ? 'font-semibold' : ''}`}>
                  <td className="py-2">{row.plan}</td>
                  <td className="text-right py-2 tabular-nums">{row.rpm.toLocaleString()}</td>
                  <td className="text-right py-2 tabular-nums">{row.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('shops');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Build integrations using the ShelfMerch Public API. Manage shops, tokens, webhooks, and limits.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {([
            ['shops', 'Shops'],
            ['apikeys', 'API Keys'],
            ['webhooks', 'Webhooks'],
            ['limits', 'Rate Limits'],
          ] as [Tab, string][]).map(([id, label]) => (
            <TabButton key={id} label={label} active={activeTab === id} onClick={() => setActiveTab(id)} />
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'shops' && <ShopsTab />}
        {activeTab === 'apikeys' && <ApiKeysTab />}
        {activeTab === 'webhooks' && <WebhooksTab />}
        {activeTab === 'limits' && <RateLimitsTab />}
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
