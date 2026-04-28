import { useEffect, useState } from 'react';
import { RAW_API_URL } from '@/config';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStore } from '@/contexts/StoreContext';
import { directOrdersApi, quotationsApi, supportTicketsApi } from '@/lib/api';
import { kitsApi } from '@/lib/kits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const CATEGORIES = [
  ['damaged', 'Damaged'],
  ['not_delivered', 'Not delivered'],
  ['wrong_item', 'Wrong item'],
  ['missing_item', 'Missing item'],
  ['quality_issue', 'Quality issue'],
  ['delay', 'Delay'],
  ['other', 'Other'],
];

export default function BrandSupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState({ orderKey: '', category: 'damaged', subject: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const { selectedStore } = useStore();
  const brandId = selectedStore?.id || (selectedStore as any)?._id;

  const load = async () => {
    try {
      const [ticketRows, directRows, quoteRows, kitSendResponse] = await Promise.all([
        supportTicketsApi.list(),
        directOrdersApi.list(),
        quotationsApi.list(),
        brandId ? kitsApi.listSends(brandId) : Promise.resolve({ data: [] }),
      ]);
      setTickets(ticketRows);
      setOrders([
        ...directRows.map((order: any) => ({ key: `direct_order:${order._id}`, label: `Direct ${order._id.slice(-6)} - ₹${order.total}` })),
        ...quoteRows.map((quote: any) => ({ key: `quotation:${quote._id}`, label: `${quote.quotation?.number || 'Quotation'} - ₹${quote.total}` })),
        ...((kitSendResponse as any).data || []).map((send: any) => ({ key: `kit_send:${send._id}`, label: `Kit send ${send._id.slice(-6)} - ₹${send.total}` })),
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load support tickets');
    }
  };

  useEffect(() => { load(); }, [brandId]);

  const submitTicket = async () => {
    try {
      const [orderType, orderId] = form.orderKey.split(':');
      if (!orderId || !form.subject || !form.description) return toast.error('Fill all required fields');
      let attachments: string[] = [];
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        const token = localStorage.getItem('token');
        const res = await fetch(`${RAW_API_URL}/api/upload/image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Upload failed');
        attachments = [data.url];
      }
      await supportTicketsApi.create({ orderId, orderType, subject: form.subject, category: form.category, description: form.description, attachments });
      toast.success('Support ticket raised');
      setForm({ orderKey: '', category: 'damaged', subject: '', description: '' });
      setFile(null);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to raise ticket');
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    try {
      const updated = await supportTicketsApi.sendMessage(selectedTicket._id, reply);
      setSelectedTicket(updated);
      setReply('');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">Raise and track order-specific support tickets.</p>
        </div>
        <Tabs defaultValue="tickets">
          <TabsList><TabsTrigger value="tickets">My Tickets</TabsTrigger><TabsTrigger value="raise">Raise Ticket</TabsTrigger></TabsList>
          <TabsContent value="tickets">
            <Card>
              <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{ticket.ticketNumber} - {ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">{ticket.category.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ticket.status.replace('_', ' ')}</Badge>
                      <Button size="sm" onClick={() => setSelectedTicket(ticket)}>View</Button>
                    </div>
                  </div>
                ))}
                {!tickets.length && <p className="text-muted-foreground">No tickets yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="raise">
            <Card>
              <CardHeader><CardTitle>Raise Ticket</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Order</Label><Select value={form.orderKey} onValueChange={(v) => setForm((p) => ({ ...p, orderKey: v }))}><SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger><SelectContent>{orders.map((order) => <SelectItem key={order.key} value={order.key}>{order.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
                <div><Label>Attachment</Label><Input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
                <Button onClick={submitTicket}>Submit Ticket</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedTicket?.ticketNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(selectedTicket?.messages || []).map((message: any, index: number) => (
              <div key={index} className={`rounded-lg p-3 ${message.fromRole === 'brand' ? 'bg-primary text-primary-foreground ml-8' : 'bg-muted mr-8'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
            ))}
          </div>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." />
          <Button onClick={sendReply}>Send Reply</Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
