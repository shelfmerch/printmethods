import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { Card } from '@/components/ui/card';
import { Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { directOrdersApi, storeOrdersApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

type OrderChannel = 'storefront' | 'direct';

interface MerchantOrderRow {
  _id: string;
  status: string;
  total: number;
  createdAt?: string;
  customerEmail?: string;
  items?: any[];
  shipment?: {
    trackingNumber?: string;
    trackingUrl?: string;
  };
  storeId?: { _id?: string; id?: string; name?: string } | string;
  orderType: OrderChannel;
}

const formatStatus = (status: string) =>
  status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const Orders = () => {
  const navigate = useNavigate();
  const { selectedStore } = useStore();
  const [allOrders, setAllOrders] = useState<MerchantOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [trackingFilter, setTrackingFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const [storeOrders, directOrders] = await Promise.all([
          storeOrdersApi.listForMerchant(),
          directOrdersApi.list(),
        ]);

        if (!isMounted) return;

        let normalizedStoreOrders: MerchantOrderRow[] = (storeOrders || []).map((order: any) => ({
          ...order,
          orderType: 'storefront',
        }));

        if (selectedStore) {
          const selectedStoreId = selectedStore.id || selectedStore._id;
          normalizedStoreOrders = normalizedStoreOrders.filter((order: any) => {
            const orderStoreId = order.storeId?._id?.toString() || order.storeId?.toString() || order.storeId;
            return orderStoreId === selectedStoreId || orderStoreId === selectedStore._id || orderStoreId === selectedStore.id;
          });
        }

        const normalizedDirectOrders: MerchantOrderRow[] = (directOrders || []).map((order: any) => ({
          ...order,
          orderType: 'direct',
        }));

        setAllOrders([...normalizedStoreOrders, ...normalizedDirectOrders].sort((a, b) => {
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        }));
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load orders');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [selectedStore]);

  const orders = useMemo(() => {
    return allOrders.filter((order) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || Boolean(
        order.customerEmail?.toLowerCase().includes(query) ||
        order.items?.some((item: any) => String(item.productName || '').toLowerCase().includes(query)) ||
        String(order._id || '').toLowerCase().includes(query)
      );

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || order.orderType === channelFilter;
      const hasTracking = Boolean(order.shipment?.trackingNumber || order.shipment?.trackingUrl);
      const matchesTracking =
        trackingFilter === 'all' ||
        (trackingFilter === 'available' && hasTracking) ||
        (trackingFilter === 'missing' && !hasTracking) ||
        (trackingFilter === 'needs-action' && ['on-hold', 'paid'].includes(order.status));

      const matchesMonth =
        monthFilter === 'all' ||
        (order.createdAt ? new Date(order.createdAt).getMonth() === Number(monthFilter) : false);

      return matchesSearch && matchesStatus && matchesChannel && matchesTracking && matchesMonth;
    });
  }, [allOrders, searchQuery, statusFilter, channelFilter, trackingFilter, monthFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'in-production':
        return 'bg-violet-500/10 text-violet-600';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600';
      case 'delivered':
        return 'bg-green-500/10 text-green-600';
      case 'on-hold':
        return 'bg-amber-500/10 text-amber-600';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const goToOrder = (order: MerchantOrderRow) => {
    navigate(order.orderType === 'direct' ? `/orders/direct/${order._id}` : `/orders/${order._id}`);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="mt-1 text-muted-foreground">
              Track order progress, shipment readiness, and missing tracking details in one place.
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email, product, or order ID"
              className="pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="in-production">In Production</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Channels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="storefront">Storefront</SelectItem>
                <SelectItem value="direct">Direct Bulk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={trackingFilter} onValueChange={setTrackingFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tracking State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracking States</SelectItem>
                <SelectItem value="available">Tracking Available</SelectItem>
                <SelectItem value="missing">Missing Tracking</SelectItem>
                <SelectItem value="needs-action">Needs Action</SelectItem>
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Months" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, month) => (
                  <SelectItem key={month} value={String(month)}>
                    {new Date(2026, month, 1).toLocaleString('en-IN', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No orders match the current filters.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Channel</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tracking</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => {
                    const primaryItem = order.items?.[0];
                    const trackingAvailable = Boolean(order.shipment?.trackingNumber || order.shipment?.trackingUrl);

                    return (
                      <tr key={`${order.orderType}-${order._id}`} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-medium">#{String(order._id).slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {primaryItem?.productName || 'Order items'}{order.items && order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant="outline">
                            {order.orderType === 'direct' ? 'Direct Bulk' : 'Storefront'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.customerEmail || 'No email'}</td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {trackingAvailable ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Tracking Available</Badge>
                              <p className="text-xs text-muted-foreground">{order.shipment?.trackingNumber || 'Tracking link added'}</p>
                            </div>
                          ) : (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Missing Tracking</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">₹{Number(order.total || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => goToOrder(order)}>
                            View
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
