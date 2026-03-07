import { useState, useEffect } from 'react';
import { adminShopifyOrdersApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Package, User, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ShopifyOrdersTab() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    // Detail Drawer state
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminShopifyOrdersApi.list({
                page,
                q: searchQuery,
                limit: 20
            });
            // Backend returns: { success, page, limit, total, pages, orders: [...] }
            const ordersData = (response as any).orders || (response as any).data || [];
            const total = (response as any).total ?? ordersData.length;
            const pages = (response as any).pages ?? (response as any).totalPages ?? 1;

            setOrders(ordersData);
            setTotalPages(pages);
            setTotalOrders(total);
        } catch (err: any) {
            console.error('Failed to fetch Shopify orders:', err);
            setError(err.message || 'Failed to load Shopify orders');
            toast.error(err.message || 'Failed to load Shopify orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (order: any) => {
        // Normalize order shape for the detail drawer using stored raw payload
        const raw = (order as any).raw || {};

        const customer = {
            firstName: raw.customer?.first_name
                || raw.billing_address?.first_name
                || raw.shipping_address?.first_name
                || '',
            lastName: raw.customer?.last_name
                || raw.billing_address?.last_name
                || raw.shipping_address?.last_name
                || '',
            email: raw.email
                || raw.customer?.email
                || '',
            phone: raw.phone
                || raw.customer?.phone
                || raw.shipping_address?.phone
                || null,
        };

        const shippingAddress = raw.shipping_address
            ? {
                name: raw.shipping_address.name
                    || `${raw.shipping_address.first_name || ''} ${raw.shipping_address.last_name || ''}`.trim(),
                address1: raw.shipping_address.address1,
                address2: raw.shipping_address.address2,
                city: raw.shipping_address.city,
                province: raw.shipping_address.province,
                zip: raw.shipping_address.zip,
                country: raw.shipping_address.country,
                phone: raw.shipping_address.phone || null,
            }
            : null;

        const billingAddress = raw.billing_address
            ? {
                name: raw.billing_address.name
                    || `${raw.billing_address.first_name || ''} ${raw.billing_address.last_name || ''}`.trim(),
                address1: raw.billing_address.address1,
                address2: raw.billing_address.address2,
                city: raw.billing_address.city,
                province: raw.billing_address.province,
                zip: raw.billing_address.zip,
                country: raw.billing_address.country,
            }
            : null;

        const lineItems = (raw.line_items || []).map((li: any) => ({
            id: String(li.id),
            title: li.title,
            variantTitle: li.variant_title,
            sku: li.sku,
            quantity: li.quantity,
            price: Number(li.price || 0),
            image: li.image?.src || undefined,
        }));

        const normalized = {
            ...order,
            customer,
            shippingAddress,
            billingAddress,
            lineItems,
            currency: order.currency || raw.currency || raw.presentment_currency || 'USD',
            subtotalPrice: Number(raw.subtotal_price || 0),
            taxPrice: Number(raw.total_tax || 0),
            totalPrice: Number(order.totalPrice ?? raw.total_price ?? raw.current_total_price ?? 0),
        };

        setSelectedOrderId(order.shopifyOrderId);
        setSelectedOrder(normalized);
        setIsDrawerOpen(true);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, searchQuery]);

    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'paid' || s === 'authorized' || s === 'processed') return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 capitalize">{status}</Badge>;
        if (s === 'on-hold' || s === 'received' || s === 'pending') return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 capitalize">{status}</Badge>;
        if (s === 'cancelled' || s === 'failed' || s === 'voided') return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 capitalize">{status}</Badge>;
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shopify Orders</h2>
                    <p className="text-muted-foreground">
                        View and manage orders synced from Shopify stores.
                    </p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Financial</TableHead>
                            <TableHead>Fulfillment</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading orders...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    {error ? (
                                        <div className="text-destructive font-medium">{error}</div>
                                    ) : (
                                        "No Shopify orders found."
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow
                                    key={order._id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleRowClick(order)}
                                >
                                    <TableCell className="font-medium">
                                        <div>{order.orderName || order.name}</div>
                                        <div className="text-xs text-muted-foreground">ID: {order.shopifyOrderId}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">
                                            {order.merchantName || '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-mono">{order.shop}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {order.itemsCount ?? 0}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {order.currency}{' '}
                                        {typeof order.totalPrice === 'number'
                                            ? order.totalPrice.toFixed(2)
                                            : Number(order.totalPrice || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(order.financialStatus)}
                                    </TableCell>
                                    <TableCell>
                                        {order.fulfillmentStatus ? getStatusBadge(order.fulfillmentStatus) : 'Unfulfilled'}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {order.createdAtShopify ? format(new Date(order.createdAtShopify), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && totalOrders > 0 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Showing {orders.length} of {totalOrders} orders
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = page;
                                if (totalPages > 5) {
                                    if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = page - 2 + i;
                                } else {
                                    pageNum = i + 1;
                                }

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            isActive={page === pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Order Detail Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col h-full bg-background border-l shadow-2xl">
                    {isFetchingDetail || !selectedOrder ? (
                        <div className="p-6 space-y-6 flex-1 overflow-auto">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-24" />
                                <Skeleton className="h-24" />
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <SheetHeader className="p-6 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <SheetTitle className="text-xl flex items-center gap-2">
                                            <ShoppingBag className="h-5 w-5 text-primary" />
                                            Order {selectedOrder.name}
                                        </SheetTitle>
                                        <SheetDescription className="text-xs font-mono">
                                            Shopify ID: {selectedOrder.orderId} • {selectedOrder.shop}
                                        </SheetDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {getStatusBadge(selectedOrder.financialStatus)}
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            Financial Status
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>

                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-8">
                                    {/* Customer & Info Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                Customer Information
                                            </div>
                                            {selectedOrder.customer ? (
                                                <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-1">
                                                    <div className="font-bold text-base">
                                                        {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                                                    </div>
                                                    <div className="text-sm text-primary hover:underline cursor-pointer">
                                                        {selectedOrder.customer.email}
                                                    </div>
                                                    {selectedOrder.customer.phone && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {selectedOrder.customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic">No customer information available</div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                Delivery Status
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 flex flex-col items-start gap-2">
                                                {selectedOrder.fulfillmentStatus ? getStatusBadge(selectedOrder.fulfillmentStatus) : (
                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 capitalize">
                                                        Unfulfilled
                                                    </Badge>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    Ordered on {selectedOrder.createdAtShopify ? format(new Date(selectedOrder.createdAtShopify), 'PPP p') : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Addresses Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                Shipping Address
                                            </div>
                                            {selectedOrder.shippingAddress ? (
                                                <div className="text-sm border rounded-lg p-4 bg-card shadow-sm space-y-1">
                                                    <div className="font-semibold">{selectedOrder.shippingAddress.name}</div>
                                                    <div>{selectedOrder.shippingAddress.address1}</div>
                                                    {selectedOrder.shippingAddress.address2 && <div>{selectedOrder.shippingAddress.address2}</div>}
                                                    <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.zip}</div>
                                                    <div>{selectedOrder.shippingAddress.country}</div>
                                                    {selectedOrder.shippingAddress.phone && <div className="pt-1 text-muted-foreground">📞 {selectedOrder.shippingAddress.phone}</div>}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic border rounded-lg p-4 bg-muted/10">No shipping address</div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                Billing Address
                                            </div>
                                            {selectedOrder.billingAddress ? (
                                                <div className="text-sm border rounded-lg p-4 bg-card shadow-sm space-y-1">
                                                    <div className="font-semibold">{selectedOrder.billingAddress.name}</div>
                                                    <div>{selectedOrder.billingAddress.address1}</div>
                                                    {selectedOrder.billingAddress.address2 && <div>{selectedOrder.billingAddress.address2}</div>}
                                                    <div>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.province} {selectedOrder.billingAddress.zip}</div>
                                                    <div>{selectedOrder.billingAddress.country}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic border rounded-lg p-4 bg-muted/10">Same as shipping or not provided</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Line Items Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                <Package className="h-4 w-4" />
                                                Order Items ({selectedOrder.lineItems?.length || 0})
                                            </div>
                                        </div>
                                        <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="w-[300px]">Product</TableHead>
                                                        <TableHead className="text-center">Qty</TableHead>
                                                        <TableHead className="text-right">Price</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedOrder.lineItems?.map((item: any) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>
                                                                <div className="flex gap-3">
                                                                    {item.image && (
                                                                        <div className="h-10 w-10 rounded border bg-muted flex-shrink-0 overflow-hidden">
                                                                            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                                                        </div>
                                                                    )}
                                                                    <div className="space-y-0.5">
                                                                        <div className="text-sm font-bold leading-tight line-clamp-1">{item.title}</div>
                                                                        {item.variantTitle && (
                                                                            <div className="text-[10px] text-muted-foreground font-medium uppercase px-1.5 py-0.5 bg-muted rounded w-fit">
                                                                                {item.variantTitle}
                                                                            </div>
                                                                        )}
                                                                        {item.sku && <div className="text-[10px] font-mono text-muted-foreground/70">SKU: {item.sku}</div>}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-medium">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs">
                                                                {selectedOrder.currency}{' '}
                                                                {typeof item.price === 'number'
                                                                    ? item.price.toFixed(2)
                                                                    : Number(item.price || 0).toFixed(2)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold">
                                                                {selectedOrder.currency}{' '}
                                                                {(() => {
                                                                    const priceNum = typeof item.price === 'number'
                                                                        ? item.price
                                                                        : Number(item.price || 0);
                                                                    const qtyNum = Number(item.quantity || 0);
                                                                    return (priceNum * qtyNum).toFixed(2);
                                                                })()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            <CreditCard className="h-4 w-4" />
                                            Financial Summary
                                        </div>
                                        <div className="bg-muted/20 p-5 rounded-xl border space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>
                                                    {selectedOrder.currency}{' '}
                                                    {typeof selectedOrder.subtotalPrice === 'number'
                                                        ? selectedOrder.subtotalPrice.toFixed(2)
                                                        : Number(selectedOrder.subtotalPrice || 0).toFixed(2)}
                                                </span>
                                            </div>

                                            {selectedOrder.discounts && selectedOrder.discounts.length > 0 && selectedOrder.discounts.map((discount: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm text-green-600 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-600 border-green-600/20">PROMO</Badge>
                                                        {discount.code}
                                                    </span>
                                                    <span>
                                                        -{selectedOrder.currency}{' '}
                                                        {typeof discount.amount === 'number'
                                                            ? discount.amount.toFixed(2)
                                                            : Number(discount.amount || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tax</span>
                                                <span>
                                                    {selectedOrder.currency}{' '}
                                                    {typeof selectedOrder.taxPrice === 'number'
                                                        ? selectedOrder.taxPrice.toFixed(2)
                                                        : Number(selectedOrder.taxPrice || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-black">
                                                <span>Total</span>
                                                <span className="text-primary">
                                                    {selectedOrder.currency}{' '}
                                                    {typeof selectedOrder.totalPrice === 'number'
                                                        ? selectedOrder.totalPrice.toFixed(2)
                                                        : Number(selectedOrder.totalPrice || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
