import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ExternalLink, Loader2, Package, Truck } from 'lucide-react';
import { directOrdersApi, storeOrdersApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type ShipmentStatus = 'on-hold' | 'paid' | 'in-production' | 'shipped' | 'delivered' | 'fulfilled' | 'cancelled' | 'refunded';

const STATUS_OPTIONS: ShipmentStatus[] = ['on-hold', 'paid', 'in-production', 'shipped', 'delivered', 'fulfilled', 'cancelled', 'refunded'];
const TIMELINE_STEPS: ShipmentStatus[] = ['on-hold', 'paid', 'in-production', 'shipped', 'delivered'];

const formatStatus = (status?: string) =>
  (status || 'on-hold')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getStatusTone = (status?: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'in-production':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'on-hold':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const toInputDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const MerchantOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDirectOrder = location.pathname.includes('/orders/direct/');
  const { user } = useAuth();
  const canEditShipment = user?.role === 'superadmin';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingShipment, setSavingShipment] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [shipmentForm, setShipmentForm] = useState({
    status: 'on-hold' as ShipmentStatus,
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    shippedAt: '',
    deliveredAt: '',
    internalNotes: '',
  });

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = isDirectOrder
          ? await directOrdersApi.getById(id)
          : await storeOrdersApi.getById(id);
        setOrder(data);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, isDirectOrder]);

  useEffect(() => {
    if (!order) return;
    setShipmentForm({
      status: (order.status || 'on-hold') as ShipmentStatus,
      carrier: order.shipment?.carrier || '',
      trackingNumber: order.shipment?.trackingNumber || '',
      trackingUrl: order.shipment?.trackingUrl || '',
      shippedAt: toInputDateTime(order.shipment?.shippedAt),
      deliveredAt: toInputDateTime(order.shipment?.deliveredAt),
      internalNotes: order.shipment?.internalNotes || '',
    });
  }, [order]);

  const statusHistory = useMemo(() => {
    const history = Array.isArray(order?.shipment?.statusHistory) ? [...order.shipment.statusHistory] : [];
    return history.sort((a: any, b: any) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [order]);

  const latestStatusUpdate = order?.shipment?.statusUpdatedAt || order?.updatedAt || order?.createdAt;

  const handleStatusSave = async () => {
    if (!id) return;
    try {
      setSavingStatus(true);
      const data = isDirectOrder
        ? await directOrdersApi.updateStatus(id, shipmentForm.status, statusNote)
        : await storeOrdersApi.updateStatus(id, shipmentForm.status, statusNote);
      setOrder(data);
      setStatusNote('');
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update order status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleShipmentSave = async () => {
    if (!id) return;
    try {
      setSavingShipment(true);
      const payload = {
        status: shipmentForm.status,
        carrier: shipmentForm.carrier,
        trackingNumber: shipmentForm.trackingNumber,
        trackingUrl: shipmentForm.trackingUrl,
        shippedAt: shipmentForm.shippedAt ? new Date(shipmentForm.shippedAt).toISOString() : undefined,
        deliveredAt: shipmentForm.deliveredAt ? new Date(shipmentForm.deliveredAt).toISOString() : undefined,
        internalNotes: shipmentForm.internalNotes,
        note: 'Shipment fields updated manually',
      };
      const data = isDirectOrder
        ? await directOrdersApi.updateShipment(id, payload)
        : await storeOrdersApi.updateShipment(id, payload);
      setOrder(data);
      toast.success('Shipment details updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update shipment details');
    } finally {
      setSavingShipment(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <Card className="p-10 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This order may have been removed or you may not have access.</p>
          <Button className="mt-6" onClick={() => navigate('/orders')}>Back to Orders</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" className="w-fit px-0 text-muted-foreground" onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {isDirectOrder ? 'Direct Bulk Order' : 'Storefront Order'} #{String(order._id).slice(-8).toUpperCase()}
              </h1>
              <Badge variant="outline" className={getStatusTone(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated {formatDateTime(latestStatusUpdate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Card className="px-4 py-3">
              <p className="text-xs uppercase text-muted-foreground">Customer</p>
              <p className="font-semibold">{order.customerEmail || 'No email'}</p>
            </Card>
            <Card className="px-4 py-3">
              <p className="text-xs uppercase text-muted-foreground">Total</p>
              <p className="font-semibold">₹{Number(order.total || 0).toFixed(2)}</p>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Journey</CardTitle>
                <CardDescription>Production and shipment milestones for this order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-5">
                  {TIMELINE_STEPS.map((step, index) => {
                    const currentIndex = TIMELINE_STEPS.indexOf((order.status || 'on-hold') as ShipmentStatus);
                    const isDone = currentIndex >= index;
                    return (
                      <div key={step} className={`rounded-xl border p-3 ${isDone ? 'border-green-200 bg-green-50' : 'border-border bg-background'}`}>
                        <p className="text-xs uppercase text-muted-foreground">Step {index + 1}</p>
                        <p className="mt-1 font-semibold">{formatStatus(step)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {statusHistory.length > 0 ? statusHistory.map((entry: any, index: number) => (
                    <div key={`${entry.status}-${entry.at}-${index}`} className="flex gap-3 rounded-xl border p-4">
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${index === statusHistory.length - 1 ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{formatStatus(entry.status)}</p>
                          <span className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</span>
                        </div>
                        {entry.note ? (
                          <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
                        ) : null}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No timeline events recorded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
                <CardDescription>{order.items?.length || 0} line items in this order.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(order.items || []).map((item: any, index: number) => (
                  <div key={`${item.productName}-${index}`} className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {[item.variant?.size || item.size, item.variant?.color || item.color].filter(Boolean).join(' / ') || 'Variant not specified'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">x{item.quantity}</p>
                      <p className="text-sm text-muted-foreground">₹{Number(item.price || item.unitPrice || 0).toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment</CardTitle>
                <CardDescription>
                  {canEditShipment
                    ? 'Manual tracking fields for the superadmin operations team.'
                    : 'Read-only shipment progress for the merchant team.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={shipmentForm.status}
                    onValueChange={(value) => setShipmentForm((prev) => ({ ...prev, status: value as ShipmentStatus }))}
                    disabled={!canEditShipment}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatStatus(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status note</Label>
                  <Textarea
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    placeholder="Optional note for this status change"
                    disabled={!canEditShipment}
                  />
                </div>

                {canEditShipment ? (
                  <Button onClick={handleStatusSave} disabled={savingStatus} className="w-full">
                    {savingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Status
                  </Button>
                ) : null}

                <div className="space-y-2">
                  <Label>Carrier</Label>
                  <Input value={shipmentForm.carrier} onChange={(event) => setShipmentForm((prev) => ({ ...prev, carrier: event.target.value }))} placeholder="Delhivery, Blue Dart, DHL" disabled={!canEditShipment} />
                </div>

                <div className="space-y-2">
                  <Label>Tracking Number</Label>
                  <Input value={shipmentForm.trackingNumber} onChange={(event) => setShipmentForm((prev) => ({ ...prev, trackingNumber: event.target.value }))} placeholder="AWB / tracking number" disabled={!canEditShipment} />
                </div>

                <div className="space-y-2">
                  <Label>Tracking URL</Label>
                  <Input value={shipmentForm.trackingUrl} onChange={(event) => setShipmentForm((prev) => ({ ...prev, trackingUrl: event.target.value }))} placeholder="https://tracking.example.com/..." disabled={!canEditShipment} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Shipped At</Label>
                    <Input type="datetime-local" value={shipmentForm.shippedAt} onChange={(event) => setShipmentForm((prev) => ({ ...prev, shippedAt: event.target.value }))} disabled={!canEditShipment} />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivered At</Label>
                    <Input type="datetime-local" value={shipmentForm.deliveredAt} onChange={(event) => setShipmentForm((prev) => ({ ...prev, deliveredAt: event.target.value }))} disabled={!canEditShipment} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea
                    value={shipmentForm.internalNotes}
                    onChange={(event) => setShipmentForm((prev) => ({ ...prev, internalNotes: event.target.value }))}
                    placeholder="Notes only visible to the operational team"
                    disabled={!canEditShipment}
                  />
                </div>

                {canEditShipment ? (
                  <Button onClick={handleShipmentSave} disabled={savingShipment} className="w-full">
                    {savingShipment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                    Save Shipment Details
                  </Button>
                ) : (
                  <p className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                    Superadmin updates shipment details. Your team can track the current status and tracking link here.
                  </p>
                )}

                {order.shipment?.trackingUrl ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">
                      Open Tracking
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {isDirectOrder ? (
                  <>
                    <p><span className="font-medium">Mode:</span> {formatStatus(order.deliveryMode || 'single address')}</p>
                    {order.deliveryCountries?.length ? (
                      <p><span className="font-medium">Countries:</span> {order.deliveryCountries.join(', ')}</p>
                    ) : null}
                    {order.deliveryNote ? (
                      <p><span className="font-medium">Delivery note:</span> {order.deliveryNote}</p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="font-medium">{order.shippingAddress?.fullName || 'Recipient not set'}</p>
                    <p className="text-muted-foreground">
                      {[
                        order.shippingAddress?.address1,
                        order.shippingAddress?.address2,
                        order.shippingAddress?.city,
                        order.shippingAddress?.state,
                        order.shippingAddress?.zipCode,
                        order.shippingAddress?.country,
                      ].filter(Boolean).join(', ')}
                    </p>
                  </>
                )}
                <p><span className="font-medium">Payment:</span> {order.payment?.method || 'Razorpay'}</p>
                {!isDirectOrder && order.storeId?.name ? (
                  <p><span className="font-medium">Store:</span> {order.storeId.name}</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MerchantOrderDetail;
