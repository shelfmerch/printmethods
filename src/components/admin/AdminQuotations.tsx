import { useEffect, useState } from 'react';
import { quotationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const money = (value: number) => `₹${Number(value || 0).toFixed(2)}`;
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : '-';

export function AdminQuotations() {
  const [status, setStatus] = useState('all');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setQuotes(await quotationsApi.list(status));
    } catch (err: any) {
      toast.error(err.message || 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const confirmPayment = async (quote: any) => {
    try {
      await quotationsApi.confirmPayment(quote._id, 'Offline payment confirmed by superadmin');
      toast.success('Payment confirmed');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground mt-1">Draft quotation orders, purchase orders, and advance payment state.</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="quotation">Quotation</SelectItem>
            <SelectItem value="po_received">PO Received</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>All Quotations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote._id}>
                  <TableCell className="font-medium">{quote.quotation?.number || '-'}</TableCell>
                  <TableCell>{quote.merchantId?.companyName || quote.merchantId?.name || quote.customerEmail}</TableCell>
                  <TableCell>{date(quote.createdAt)}</TableCell>
                  <TableCell>{date(quote.quotation?.validUntil)}</TableCell>
                  <TableCell>{(quote.items || []).map((item: any) => `${item.productName || item.catalogProductId?.name} x ${item.quantity}`).join(', ')}</TableCell>
                  <TableCell>{money(quote.total)}</TableCell>
                  <TableCell><Badge variant="outline">{quote.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-right">
                    {quote.status === 'po_received' ? (
                      <Button size="sm" onClick={() => confirmPayment(quote)}>Confirm Payment</Button>
                    ) : quote.quotation?.purchaseOrderUrl ? (
                      <Button size="sm" variant="outline" asChild><a href={quote.quotation.purchaseOrderUrl} target="_blank" rel="noreferrer">Open PO</a></Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !quotes.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No quotations found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
