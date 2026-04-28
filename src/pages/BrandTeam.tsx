import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Loader2, RefreshCw, Mail } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RAW_API_URL } from '@/config';

const ROLES = [
  { value: 'brand_admin', label: 'Brand Admin', desc: 'Full access to all store settings' },
  { value: 'hr_manager', label: 'HR Manager', desc: 'Manage employees and credit allocation' },
  { value: 'finance', label: 'Finance', desc: 'View billing, invoices, and wallet' },
  { value: 'marketing', label: 'Marketing', desc: 'Manage products and store builder' },
];

const ROLE_COLORS: Record<string, string> = {
  brand_admin: 'bg-purple-100 text-purple-800',
  hr_manager: 'bg-blue-100 text-blue-800',
  finance: 'bg-green-100 text-green-800',
  marketing: 'bg-orange-100 text-orange-800',
};

interface TeamMember {
  _id: string;
  inviteEmail: string;
  role: string;
  inviteStatus: string;
  userId?: { name: string; email: string; avatar?: string };
  createdAt: string;
}

const BrandTeam = () => {
  const { selectedStore } = useStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('hr_manager');
  const [inviting, setInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const brandId = selectedStore?.id || selectedStore?._id;
  const token = localStorage.getItem('token');

  const fetchMembers = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-team/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMembers(data.data);
    } catch { toast.error('Failed to load team members'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, [brandId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-team/${brandId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      setDialogOpen(false);
      fetchMembers();
    } catch (err: any) { toast.error(err.message || 'Failed to send invite'); }
    finally { setInviting(false); }
  };

  const handleRemove = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from the team?`)) return;
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-team/${brandId}/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Team member removed');
      setMembers(prev => prev.filter(m => m._id !== memberId));
    } catch (err: any) { toast.error(err.message || 'Failed to remove member'); }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Invite colleagues to help manage your swag store.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchMembers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="mr-2 h-4 w-4" />Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Work Email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setInviteRole(r.value)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          inviteRole === r.value ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-sm">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={inviting}>
                  {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send Invite
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserPlus className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No team members yet</p>
            <p className="text-sm text-muted-foreground mt-1">Invite HR, finance, or marketing colleagues to help manage your store.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Team Members ({members.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {members.map(m => (
                <div key={m._id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                      {(m.userId?.name || m.inviteEmail)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{m.userId?.name || m.inviteEmail}</p>
                      {m.userId && <p className="text-xs text-muted-foreground">{m.userId.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-700'}`}>
                      {ROLES.find(r => r.value === m.role)?.label || m.role}
                    </span>
                    <Badge variant={m.inviteStatus === 'accepted' ? 'default' : 'secondary'}>
                      {m.inviteStatus}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(m._id, m.inviteEmail)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
};

export default BrandTeam;
