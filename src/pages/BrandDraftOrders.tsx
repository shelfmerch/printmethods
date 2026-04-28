import { useEffect, useMemo, useState } from 'react';
import { RAW_API_URL } from '@/config';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { quotationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window { Razorpay: any; }
}

const money = (value: number) => `₹${Number(value || 0).toFixed(2)}`;
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : '-';

const badgeClass = (status: string) => {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-800';
  if (status === 'partially_paid') return 'bg-amber-100 text-amber-800';
  if (status === 'po_received') return 'bg-blue-100 text-blue-800';
  return 'bg-muted text-muted-foreground';
};

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function BrandDraftOrders() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poFile, setPoFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setQuotes(await quotationsApi.list());
    } catch (err: any) {
      toast.error(err.message || 'Failed to load draft orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuotes(); }, []);

  const selectedDefaultAdvance = useMemo(() => selected ? Math.ceil(Number(selected.total || 0) / 2) : 0, [selected]);

  const downloadPdf = async (quote: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${RAW_API_URL}/api/quotation-pdf/${quote._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to download quotation');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${quote.quotation?.number || 'quotation'}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || 'Failed to download PDF');
    }
  };

  const startAdvance = (quote: any) => {
    setSelected(quote);
    setAdvanceAmount(String(Math.ceil(Number(quote.total || 0) / 2)));
    setAdvanceOpen(true);
  };

  const payAdvance = async () => {
    if (!selected) return;
    const loaded = await loadRazorpay();
    if (!loaded) return toast.error('Could not load payment gateway');
    const amountPaise = Math.round(Number(advanceAmount || selectedDefaultAdvance) * 100);
    setWorking(true);
    try {
      const order = await quotationsApi.createAdvance(selected._id, amountPaise);
      new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'ShelfMerch',
        description: `Advance for ${selected.quotation?.number}`,
        handler: async (response: any) => {
          try {
            await quotationsApi.verifyAdvance(selected._id, {
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amountPaise,
            });
            toast.success('Advance payment recorded');
            setAdvanceOpen(false);
            loadQuotes();
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          } finally {
            setWorking(false);
          }
        },
        modal: { ondismiss: () => setWorking(false) },
        theme: { color: '#000000' },
      }).open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start advance payment');
      setWorking(false);
    }
  };

  const uploadPO = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      let purchaseOrderUrl = '';
      const token = localStorage.getItem('token');
      if (poFile) {
        const form = new FormData();
        form.append('image', poFile);
        const res = await fetch(`${RAW_API_URL}/api/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to upload PO');
        purchaseOrderUrl = data.url;
      }
      await quotationsApi.uploadPO(selected._id, { purchaseOrderUrl, purchaseOrderNumber: poNumber });
      toast.success('Purchase order uploaded');
      setPoOpen(false);
      setPoFile(null);
      setPoNumber('');
      loadQuotes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload PO');
    } finally {
      setWorking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Draft Orders</h1>
          <p className="text-muted-foreground mt-1">Quotations awaiting approval, PO, or advance payment.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Quotations</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation No.</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => {
                    const expired = quote.quotation?.validUntil && new Date(quote.quotation.validUntil) < new Date() && quote.status === 'quotation';
                    return (
                      <TableRow key={quote._id}>
                        <TableCell className="font-medium">{quote.quotation?.number || '-'}</TableCell>
                        <TableCell>{date(quote.createdAt)}</TableCell>
                        <TableCell>{date(quote.quotation?.validUntil)} {expired && <Badge variant="outline" className="ml-2">Expired - re-quote?</Badge>}</TableCell>
                        <TableCell>{(quote.items || []).map((item: any) => `${item.productName || item.catalogProductId?.name} x ${item.quantity}`).join(', ')}</TableCell>
                        <TableCell>{money(quote.total)}</TableCell>
                        <TableCell><Badge className={badgeClass(quote.status)}>{quote.status.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => downloadPdf(quote)}><Download className="h-4 w-4 mr-1" />PDF</Button>
                          <Button size="sm" variant="outline" onClick={() => startAdvance(quote)}>Pay Advance</Button>
                          <Button size="sm" onClick={() => { setSelected(quote); setPoOpen(true); }}><Upload className="h-4 w-4 mr-1" />Upload PO</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!quotes.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No draft orders yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={advanceOpen} onOpenChange={setAdvanceOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pay Advance</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount now (₹)</Label>
              <Input type="number" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} />
            </div>
            <Button onClick={payAdvance} disabled={working} className="w-full">{working && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Pay via Razorpay</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>PO Number</Label>
              <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
            </div>
            <div>
              <Label>PO Document</Label>
              <Input type="file" accept="image/*,.pdf" onChange={(e) => setPoFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={uploadPO} disabled={working} className="w-full">{working && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Upload PO</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
