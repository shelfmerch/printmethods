import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, SendHorizonal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Header, Footer } from '@/components/home/';
import KitItemPreview from '@/components/kits/KitItemPreview';
import { kitsApi } from '@/lib/kits';
import { Kit, KitSend } from '@/types/kits';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const BrandKitDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [kit, setKit] = useState<Kit | null>(null);
  const [sends, setSends] = useState<KitSend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [kitResponse, sendsResponse]: any = await Promise.all([
          kitsApi.get(id),
          kitsApi.get(id).then((res: any) => kitsApi.listSends((res.data.brandId as string))),
        ]);
        setKit(kitResponse.data);
        setSends((sendsResponse.data || []).filter((send: any) => {
          const sendKitId = typeof send.kitId === 'string' ? send.kitId : send.kitId?._id;
          return sendKitId === id;
        }));
      } catch (error: any) {
        toast.error(error.message || 'Failed to load kit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const sendSummary = useMemo(() => {
    return sends.reduce((acc, send: any) => {
      acc.total += send.recipientCount || 0;
      acc.redeemed += send.stats?.redeemed || 0;
      return acc;
    }, { total: 0, redeemed: 0 });
  }, [sends]);

  const removeKit = async () => {
    if (!id || !confirm('Delete this kit? This only works when there are no paid sends.')) return;
    try {
      await kitsApi.remove(id);
      toast.success('Kit deleted');
      navigate('/brand/kits');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete kit');
    }
  };

  const closeCampaign = async (sendId: string) => {
    try {
      await kitsApi.closeSend(sendId);
      toast.success('Campaign closed');
      setSends((current) => current.map((send) => send._id === sendId ? { ...send, status: 'closed' } : send));
    } catch (error: any) {
      toast.error(error.message || 'Failed to close campaign');
    }
  };

  if (!kit && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <Button variant="ghost" className="px-0" asChild>
            <Link to="/brand/kits">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to kits
            </Link>
          </Button>

          {kit && (
            <>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold">{kit.name}</h1>
                    <Badge className={kit.status === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                      {kit.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {kit.items.length} item{kit.items.length === 1 ? '' : 's'} in this kit. {sendSummary.redeemed}/{sendSummary.total} redemptions completed so far.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <Link to={`/brand/kits/${kit._id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit kit
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to={`/brand/kits/${kit._id}/send`}>
                      <SendHorizonal className="mr-2 h-4 w-4" />
                      Send Items
                    </Link>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="items" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="sent-gifts">Sent Gifts</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {kit.items.map((item) => {
                    const product = typeof item.catalogProductId === 'string' ? undefined : item.catalogProductId;
                    return (
                      <Card key={typeof item.catalogProductId === 'string' ? item.catalogProductId : item.catalogProductId._id}>
                        <CardContent className="space-y-4 p-4">
                          <KitItemPreview product={product as any} logoUrl={item.uploadedLogoUrl} />
                          <div className="text-sm text-muted-foreground">
                            Brand logo {item.uploadedLogoUrl ? 'configured' : 'not uploaded yet'}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>

                <TabsContent value="sent-gifts" className="space-y-4">
                  {sends.map((send: any) => (
                    <Card key={send._id}>
                      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">Send #{send._id.slice(-6)}</h3>
                            <Badge variant="outline">{send.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {send.deliveryMode === 'redeem' ? 'Recipients redeem' : 'Surprise recipients'} · {send.recipientCount} recipients
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {send.stats?.redeemed || 0}/{send.stats?.total || send.recipientCount} redeemed
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {send.status !== 'closed' && (
                            <Button variant="outline" onClick={() => closeCampaign(send._id)}>
                              Close Campaign
                            </Button>
                          )}
                          {send.deliveryMode === 'redeem' && (
                            <Button variant="outline" onClick={async () => {
                              try {
                                await kitsApi.resendInvites(send._id);
                                toast.success('Invites resent');
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to resend invites');
                              }
                            }}>
                              Resend invites
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!sends.length && (
                    <Card>
                      <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        No sends yet. Launch the first campaign from this kit when you’re ready.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <h3 className="font-semibold">Kit settings</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Delete is only available when there are no paid or active sends tied to this kit.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={removeKit}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete kit
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </div>
  );
};

export default BrandKitDetail;
