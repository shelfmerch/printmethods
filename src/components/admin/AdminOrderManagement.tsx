import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Download, ExternalLink, Search, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { adminDirectOrdersApi, adminKitFulfillmentApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const DIRECT_STATUSES = [
  { label: 'All', value: 'all' },
  { label: 'Samples', value: 'sample' },
  { label: 'Paid', value: 'paid' },
  { label: 'In Production', value: 'in-production' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

const UPDATE_STATUSES = [
  { label: 'In Production', value: 'in-production' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const money = (value: number) => `₹${Number(value || 0).toFixed(2)}`;
const date = (value?: string) => value ? new Date(value).toLocaleString() : '-';

const statusBadgeClass = (status: string) => {
  if (status === 'paid' || status === 'redeemed' || status === 'ready') return 'bg-emerald-100 text-emerald-800';
  if (status === 'in-production') return 'bg-amber-100 text-amber-800';
  if (status === 'shipped' || status === 'delivered') return 'bg-blue-100 text-blue-800';
  if (status === 'cancelled' || status === 'closed') return 'bg-red-100 text-red-800';
  return 'bg-muted text-muted-foreground';
};

const productSummary = (items: any[] = []) =>
  items.map((item) => `${item.productName || item.catalogProductId?.name || 'Item'} x ${item.quantity || 0}`).join(', ');

const addressText = (address: any = {}) =>
  [address.fullName, address.phone, address.address1, address.address2, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(', ');

export function AdminOrderManagement() {
  const [activeView, setActiveView] = useState('direct');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'in-production',
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    note: '',
  });
  const [savingStatus, setSavingStatus] = useState(false);

  const [queue, setQueue] = useState<any[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [trackingForms, setTrackingForms] = useState<Record<string, { carrier: string; trackingNumber: string; trackingUrl: string }>>({});

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await adminDirectOrdersApi.list({ limit: 100 });
      setOrders(response.orders || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load direct orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadQueue = async () => {
    try {
      setQueueLoading(true);
      const response = await adminKitFulfillmentApi.getProductionQueue();
      setQueue(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load kit fulfillment queue');
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'direct') loadOrders();
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'kits') loadQueue();
  }, [activeView]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (status === 'sample' && order.orderType !== 'sample') return false;
      if (status !== 'all' && status !== 'sample' && order.status !== status) return false;
      if (!query) return true;
      return [
      order._id,
      order.customerEmail,
      order.customerName,
      productSummary(order.items),
      order.merchantId?.name,
      order.merchantId?.email,
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [orders, search, status]);

  const openOrder = async (orderId: string) => {
    try {
      const order = await adminDirectOrdersApi.getById(orderId);
      setSelectedOrder(order);
      setStatusForm({
        status: order.status === 'paid' ? 'in-production' : order.status || 'in-production',
        carrier: order.shipment?.carrier || '',
        trackingNumber: order.shipment?.trackingNumber || '',
        trackingUrl: order.shipment?.trackingUrl || '',
        note: '',
      });
      setDetailOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to open order');
    }
  };

  const saveOrderStatus = async () => {
    if (!selectedOrder) return;
    if (statusForm.status === 'shipped' && !statusForm.trackingNumber) {
      toast.error('Tracking number is required when marking shipped');
      return;
    }
    try {
      setSavingStatus(true);
      const updated = await adminDirectOrdersApi.updateStatus(selectedOrder._id, statusForm as any);
      setSelectedOrder(updated);
      setOrders((current) => current.map((order) => order._id === updated._id ? updated : order));
      toast.success('Direct order updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update direct order');
    } finally {
      setSavingStatus(false);
    }
  };

  const updateTrackingForm = (redemptionId: string, patch: Partial<{ carrier: string; trackingNumber: string; trackingUrl: string }>) => {
    setTrackingForms((current) => ({
      ...current,
      [redemptionId]: {
        carrier: current[redemptionId]?.carrier || '',
        trackingNumber: current[redemptionId]?.trackingNumber || '',
        trackingUrl: current[redemptionId]?.trackingUrl || '',
        ...patch,
      },
    }));
  };

  const markRecipientShipped = async (redemptionId: string) => {
    const form = trackingForms[redemptionId];
    if (!form?.trackingNumber) {
      toast.error('Tracking number is required');
      return;
    }
    try {
      await adminKitFulfillmentApi.markRedemptionShipped(redemptionId, form);
      toast.success('Recipient marked shipped');
      await loadQueue();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark shipped');
    }
  };

  const downloadLogos = async (catalogProductId: string) => {
    try {
      const logos = await adminKitFulfillmentApi.getLogos(catalogProductId);
      if (!logos.length) {
        toast.info('No logos found for this product');
        return;
      }
      logos.forEach((logo) => window.open(logo.uploadedLogoUrl, '_blank', 'noopener,noreferrer'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load logos');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="mt-1 text-muted-foreground">Monitor direct orders and kit fulfillment from one superadmin workspace.</p>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList>
          <TabsTrigger value="direct">Direct Orders</TabsTrigger>
          <TabsTrigger value="kits">Kit Fulfillment</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {DIRECT_STATUSES.slice(2).map((entry) => (
              <Card key={entry.value}>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{entry.label}</p>
                  <p className="mt-2 text-2xl font-bold">{orders.filter((order) => order.status === entry.value).length}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search direct orders..." className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {DIRECT_STATUSES.map((entry) => (
                <Button key={entry.value} variant={status === entry.value ? 'default' : 'outline'} size="sm" onClick={() => setStatus(entry.value)}>
                  {entry.label}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Direct Orders</CardTitle>
              <CardDescription>All direct checkout orders across brands.</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <p className="text-sm text-muted-foreground">Loading direct orders...</p>
              ) : filteredOrders.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Brand / Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{date(order.createdAt)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.merchantId?.name || order.customerName || 'Customer'}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail || order.merchantId?.email}</div>
                        </TableCell>
                      <TableCell className="max-w-[360px] truncate">
                        {order.orderType === 'sample' && <Badge variant="outline" className="mr-2">SAMPLE</Badge>}
                        {productSummary(order.items)}
                      </TableCell>
                        <TableCell>{money(order.total)}</TableCell>
                        <TableCell><Badge className={statusBadgeClass(order.status)}>{order.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openOrder(order._id)}>Open</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No direct orders found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kit Fulfillment</CardTitle>
              <CardDescription>Production queue - items redeemed and ready to ship.</CardDescription>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <p className="text-sm text-muted-foreground">Loading kit fulfillment queue...</p>
              ) : queue.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Total Qty</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((group) => {
                      const groupKey = `${group.catalogProductId}-${group.color}-${group.size}`;
                      const expanded = expandedGroup === groupKey;
                      return (
                        <Fragment key={groupKey}>
                          <TableRow key={groupKey}>
                            <TableCell>
                              <button type="button" className="inline-flex items-center gap-2 font-medium" onClick={() => setExpandedGroup(expanded ? null : groupKey)}>
                                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                {group.productName}
                              </button>
                            </TableCell>
                            <TableCell>{group.color || '-'}</TableCell>
                            <TableCell>{group.size || '-'}</TableCell>
                            <TableCell>{group.totalQty}</TableCell>
                            <TableCell>{group.campaignCount}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => downloadLogos(group.catalogProductId)}>
                                Download All Logos
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/20">
                                <div className="overflow-x-auto rounded-lg border bg-background">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Recipient</TableHead>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Tracking</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(group.recipients || []).map((recipient: any) => {
                                        const form = trackingForms[recipient.redemptionId] || {};
                                        return (
                                          <TableRow key={recipient.redemptionId}>
                                            <TableCell>
                                              <div className="font-medium">{recipient.recipientEmail || '-'}</div>
                                              <Badge className={statusBadgeClass(recipient.shippingStatus)}>{recipient.shippingStatus}</Badge>
                                            </TableCell>
                                            <TableCell>{recipient.campaignName}</TableCell>
                                            <TableCell className="max-w-[260px] text-xs text-muted-foreground">{recipient.addressText || '-'}</TableCell>
                                            <TableCell>
                                              {recipient.uploadedLogoUrl ? (
                                                <Button variant="ghost" size="sm" asChild>
                                                  <a href={recipient.uploadedLogoUrl} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Logo
                                                  </a>
                                                </Button>
                                              ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                              <div className="grid min-w-[320px] gap-2 md:grid-cols-3">
                                                <Input placeholder="Carrier" value={form.carrier || ''} onChange={(event) => updateTrackingForm(recipient.redemptionId, { carrier: event.target.value })} />
                                                <Input placeholder="Tracking no." value={form.trackingNumber || ''} onChange={(event) => updateTrackingForm(recipient.redemptionId, { trackingNumber: event.target.value })} />
                                                <Input placeholder="Tracking URL" value={form.trackingUrl || ''} onChange={(event) => updateTrackingForm(recipient.redemptionId, { trackingUrl: event.target.value })} />
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <Button size="sm" onClick={() => markRecipientShipped(recipient.redemptionId)}>
                                                <Truck className="mr-2 h-4 w-4" />
                                                Mark Shipped
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No redeemed kit items are ready for production.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Direct Order {selectedOrder?._id?.slice(-8)}</DialogTitle>
            <DialogDescription>Review designs, shipping address, status history, and tracking.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                {(selectedOrder.items || []).map((item: any, index: number) => (
                  <div key={`${item.catalogProductId?._id || item.productName}-${index}`} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="font-semibold">{item.productName || item.catalogProductId?.name || 'Item'}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.color || '-'} / {item.size || '-'} · Qty {item.quantity} · {item.decorationMethodName || item.decorationMethodId?.name || 'No decoration method'}
                        </div>
                      </div>
                      <Badge variant="outline">{money(Number(item.unitPrice || 0) * Number(item.quantity || 0))}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(item.uploadedDesignUrls || []).map((url: string, designIndex: number) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="group rounded-lg border p-3 text-sm hover:bg-muted/30">
                          <div className="mb-2 aspect-video overflow-hidden rounded-md bg-muted">
                            <img src={url} alt={`Design ${designIndex + 1}`} className="h-full w-full object-contain" />
                          </div>
                          <span className="inline-flex items-center gap-2 font-medium">
                            <Download className="h-4 w-4" />
                            Download design {designIndex + 1}
                          </span>
                        </a>
                      ))}
                      {!item.uploadedDesignUrls?.length && (
                        <div className="rounded-lg border p-3 text-sm text-muted-foreground">No design files on this item.</div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Status history</h3>
                  <div className="mt-3 space-y-3">
                    {(selectedOrder.shipment?.statusHistory || []).map((entry: any, index: number) => (
                      <div key={`${entry.status}-${entry.at}-${index}`} className="border-l-2 pl-3">
                        <div className="text-sm font-medium">{entry.status} · {date(entry.at)}</div>
                        <div className="text-xs text-muted-foreground">{entry.note || 'No note'} {entry.actor?.email ? `by ${entry.actor.email}` : ''}</div>
                      </div>
                    ))}
                    {!selectedOrder.shipment?.statusHistory?.length && (
                      <p className="text-sm text-muted-foreground">No status history yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Shipping address</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{addressText(selectedOrder.shippingAddress) || 'No shipping address'}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">Update fulfillment</h3>
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={statusForm.status} onValueChange={(value) => setStatusForm((current) => ({ ...current, status: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UPDATE_STATUSES.map((entry) => <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {statusForm.status === 'shipped' && (
                      <>
                        <div className="space-y-2">
                          <Label>Carrier</Label>
                          <Input value={statusForm.carrier} onChange={(event) => setStatusForm((current) => ({ ...current, carrier: event.target.value }))} placeholder="Delhivery" />
                        </div>
                        <div className="space-y-2">
                          <Label>Tracking Number</Label>
                          <Input value={statusForm.trackingNumber} onChange={(event) => setStatusForm((current) => ({ ...current, trackingNumber: event.target.value }))} placeholder="TEST123456" />
                        </div>
                        <div className="space-y-2">
                          <Label>Tracking URL</Label>
                          <Input value={statusForm.trackingUrl} onChange={(event) => setStatusForm((current) => ({ ...current, trackingUrl: event.target.value }))} placeholder="https://..." />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label>Production note</Label>
                      <Textarea value={statusForm.note} onChange={(event) => setStatusForm((current) => ({ ...current, note: event.target.value }))} placeholder="Pantone, packing, dispatch, or internal note" />
                    </div>
                    <Button className="w-full" onClick={saveOrderStatus} disabled={savingStatus}>
                      Save fulfillment update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
