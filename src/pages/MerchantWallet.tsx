import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Wallet,
    History,
    RefreshCw,
    ExternalLink,
    Gift,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { invoiceApi, walletApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface WalletSummary {
    balancePaise: number;
    balanceRupees: string;
    currency: string;
    status: string;
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    storeId?: { storeName: string; subdomain: string };
    orderId?: { orderNumber: string; _id: string };
    status: string;
    totalAmount: number;
    createdAt: string;
    paymentDetails?: { shortfallPaise?: number };
}

const MerchantWallet = () => {
    const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);

            const [balanceResponse, invoicesData] = await Promise.all([
                walletApi.getBalance(),
                invoiceApi.listForMerchant(),
            ]);

            const summaryData = (balanceResponse as any)?.data || balanceResponse;
            setWalletSummary(summaryData);
            setInvoices(invoicesData || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load data';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const getInvoiceStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Company Wallet</h1>
                        <p className="text-muted-foreground mt-1">
                            Top up company funds used for employee credits and fulfillment payments
                        </p>
                    </div>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Total Balance */}
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Wallet className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                        Total Balance
                                    </p>
                                    <p className="text-2xl font-bold">
                                        ₹{walletSummary?.balanceRupees || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employee Credits */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-green-500/10">
                                    <Gift className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                        Employee Credits
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        Ready
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wallet Status */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-blue-500/10 shrink-0">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold truncate">
                                        Wallet Status
                                    </p>
                                    <p className="text-2xl font-bold capitalize break-words">
                                        {(walletSummary?.status || 'active').toLowerCase()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-6">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/wallet/top-up">
                            <Wallet className="h-4 w-4 mr-2" />
                            Top Up Wallet
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/wallet/transactions">
                            <History className="h-4 w-4 mr-2" />
                            Transaction History
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Fulfillment Invoices
                </div>

                        {isLoading ? (
                            <Card className="p-12 text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading invoices...</p>
                            </Card>
                        ) : invoices.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-lg font-medium">No invoices yet</p>
                                <p className="text-muted-foreground">
                                    Your fulfillment invoices will appear here once you receive orders.
                                </p>
                            </Card>
                        ) : (
                            <Card className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Invoice
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Store/Order
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {invoices.map((inv) => (
                                                <tr key={inv._id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold">{inv.invoiceNumber}</span>
                                                            <span className="text-xs text-muted-foreground">Fulfillment</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {inv.storeId?.storeName || 'Store'}
                                                            </span>
                                                            <Link
                                                                to="/orders"
                                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                                            >
                                                                Order #{inv.orderId?.orderNumber || inv.orderId?._id?.slice(-6)}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                                        {new Date(inv.createdAt).toLocaleDateString(undefined, {
                                                            dateStyle: 'medium',
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">{getInvoiceStatusBadge(inv.status)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold">₹{inv.totalAmount?.toFixed(2)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
            </div>
        </DashboardLayout>
    );
};

export default MerchantWallet;
