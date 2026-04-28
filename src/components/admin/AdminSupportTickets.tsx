import { useEffect, useState } from 'react';
import { supportTicketsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState('');

  const load = async () => {
    try {
      setTickets(await supportTicketsApi.list());
    } catch (err: any) {
      toast.error(err.message || 'Failed to load support tickets');
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (ticket: any, status: string) => {
    try {
      await supportTicketsApi.updateStatus(ticket._id, status);
      toast.success('Ticket status updated');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket');
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    try {
      const updated = await supportTicketsApi.sendMessage(selected._id, reply);
      setSelected(updated);
      setReply('');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">Review brand order issues and reply from superadmin.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All Tickets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="grid grid-cols-1 lg:grid-cols-[1fr_180px_170px_90px] gap-3 items-center rounded-lg border p-4">
              <div>
                <p className="font-medium">{ticket.ticketNumber} - {ticket.subject}</p>
                <p className="text-sm text-muted-foreground">{ticket.brandId?.companyName || ticket.brandId?.name || ticket.brandId?.email} · {ticket.category.replace('_', ' ')}</p>
              </div>
              <Badge variant="outline" className="w-fit">{ticket.status.replace('_', ' ')}</Badge>
              <Select value={ticket.status} onValueChange={(value) => updateStatus(ticket, value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setSelected(ticket)}>Open</Button>
            </div>
          ))}
          {!tickets.length && <p className="text-muted-foreground">No tickets yet.</p>}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.ticketNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(selected?.messages || []).map((message: any, index: number) => (
              <div key={index} className={`rounded-lg p-3 ${message.fromRole === 'superadmin' ? 'bg-primary text-primary-foreground ml-8' : 'bg-muted mr-8'}`}>
                <p className="text-sm">{message.text}</p>
              </div>
            ))}
          </div>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to brand..." />
          <Button onClick={sendReply}>Send Reply</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
