import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Gift,
  Loader2,
  RefreshCw,
  Wallet,
  Users,
  ChevronDown,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RAW_API_URL } from '@/config';

// ── Types ─────────────────────────────────────────────────────────────────────
interface BrandEmployee {
  _id: string;
  email: string;
  name?: string;
  department?: string;
  inviteStatus: string;
  totalCreditAllocatedPaise: number;
}

interface Allocation {
  _id: string;
  employeeId: { email: string; name?: string; department?: string } | null;
  allocatedBy: { name: string; email: string } | null;
  amountPaise: number;
  amountRupees: string;
  occasion: string;
  note?: string;
  status: string;
  createdAt: string;
}

interface Summary {
  totalAllocatedPaise: number;
  totalAllocatedRupees: string;
  count: number;
  byOccasion: { occasion: string; totalPaise: number; totalRupees: string; count: number }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const OCCASIONS = [
  { value: 'onboarding', label: '🎉 Onboarding', color: 'bg-blue-100 text-blue-800' },
  { value: 'birthday', label: '🎂 Birthday', color: 'bg-pink-100 text-pink-800' },
  { value: 'anniversary', label: '🏆 Work Anniversary', color: 'bg-purple-100 text-purple-800' },
  { value: 'performance', label: '⭐ Performance Award', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'festival', label: '🪔 Festival Gift', color: 'bg-orange-100 text-orange-800' },
  { value: 'custom', label: '✏️ Custom', color: 'bg-gray-100 text-gray-800' },
];

const QUICK_AMOUNTS_PAISE = [50000, 100000, 200000, 500000]; // ₹500, ₹1000, ₹2000, ₹5000

const formatRupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const occasionMeta = (val: string) =>
  OCCASIONS.find((o) => o.value === val) || OCCASIONS[OCCASIONS.length - 1];

// ─────────────────────────────────────────────────────────────────────────────
const CreditAllocation = () => {
  const { selectedStore } = useStore();
  const brandId = selectedStore?.id || (selectedStore as any)?._id;
  const token = localStorage.getItem('token');

  const [employees, setEmployees] = useState<BrandEmployee[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [loadingAllocs, setLoadingAllocs] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amountPaise, setAmountPaise] = useState<number>(100000); // default ₹1000
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [occasion, setOccasion] = useState('custom');
  const [note, setNote] = useState('');
  const [allocating, setAllocating] = useState(false);

  // ── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchEmployees = async () => {
    if (!brandId) return;
    setLoadingEmps(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-employees/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEmployees(data.data.filter((e: BrandEmployee) => e.inviteStatus !== 'deactivated'));
    } catch { toast.error('Failed to load employees'); }
    finally { setLoadingEmps(false); }
  };

  const fetchAllocations = async () => {
    if (!brandId) return;
    setLoadingAllocs(true);
    try {
      const [allocRes, summRes] = await Promise.all([
        fetch(`${RAW_API_URL}/api/credit-allocation/${brandId}?limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${RAW_API_URL}/api/credit-allocation/${brandId}/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [allocData, summData] = await Promise.all([allocRes.json(), summRes.json()]);
      if (allocData.success) setAllocations(allocData.data);
      if (summData.success) setSummary(summData.data);
    } catch { toast.error('Failed to load allocation history'); }
    finally { setLoadingAllocs(false); }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAllocations();
  }, [brandId]);

  // ── Employee selection helpers ───────────────────────────────────────────────
  const toggleEmployee = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === employees.length ? [] : employees.map((e) => e._id));

  // ── Amount helpers ───────────────────────────────────────────────────────────
  const handleCustomAmount = (val: string) => {
    setCustomAmountStr(val);
    const num = Math.round(parseFloat(val) * 100);
    if (!isNaN(num) && num > 0) setAmountPaise(num);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleAllocate = async () => {
    if (selectedIds.length === 0) { toast.error('Select at least one employee'); return; }
    if (amountPaise < 100) { toast.error('Minimum credit: ₹1'); return; }

    setAllocating(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/credit-allocation/${brandId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeIds: selectedIds, amountPaise, occasion, note }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const { allocated, failed } = data.data;
      if (allocated > 0) toast.success(`Credits sent to ${allocated} employee${allocated > 1 ? 's' : ''}!`);
      if (failed > 0) toast.error(`${failed} employee(s) failed`);

      // Reset
      setSelectedIds([]);
      setNote('');
      setOccasion('custom');
      setDialogOpen(false);
      fetchAllocations();
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Allocation failed');
    } finally {
      setAllocating(false);
    }
  };

  const totalToAllocate = amountPaise * selectedIds.length;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Credit Allocation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gift company credits to employees for occasions and rewards.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => { fetchEmployees(); fetchAllocations(); }}
            disabled={loadingEmps || loadingAllocs}
          >
            <RefreshCw className={`h-4 w-4 ${(loadingEmps || loadingAllocs) ? 'animate-spin' : ''}`} />
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Gift className="mr-2 h-4 w-4" />
                Allocate Credits
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Allocate Credits to Employees</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Step 1: Select employees */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Employees ({selectedIds.length} selected)</Label>
                    <button
                      onClick={toggleAll}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedIds.length === employees.length ? (
                        <><CheckSquare className="h-3 w-3" /> Deselect All</>
                      ) : (
                        <><Square className="h-3 w-3" /> Select All</>
                      )}
                    </button>
                  </div>
                  <div className="border rounded-lg divide-y max-h-52 overflow-y-auto">
                    {loadingEmps ? (
                      <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : employees.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground">No active employees. Add employees first.</div>
                    ) : (
                      employees.map((emp) => (
                        <label
                          key={emp._id}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(emp._id)}
                            onChange={() => toggleEmployee(emp._id)}
                            className="h-4 w-4 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{emp.name || emp.email}</p>
                            <p className="text-xs text-muted-foreground truncate">{emp.email}{emp.department ? ` · ${emp.department}` : ''}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatRupees(emp.totalCreditAllocatedPaise)} allocated
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Step 2: Amount */}
                <div className="space-y-2">
                  <Label>Amount per Employee</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS_PAISE.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setAmountPaise(amt); setCustomAmountStr(''); }}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          amountPaise === amt && !customAmountStr
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted hover:border-primary/60'
                        }`}
                      >
                        {formatRupees(amt)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">₹</span>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmountStr}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                {/* Step 3: Occasion */}
                <div className="space-y-2">
                  <Label>Occasion</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setOccasion(o.value)}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          occasion === o.value
                            ? 'border-primary bg-primary/5 font-medium'
                            : 'border-muted hover:border-primary/40'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Note */}
                <div className="space-y-2">
                  <Label htmlFor="creditNote">Note (optional)</Label>
                  <Input
                    id="creditNote"
                    placeholder="e.g. Happy Diwali! Enjoy your swag gift."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={200}
                  />
                </div>

                {/* Summary */}
                {selectedIds.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employees selected</span>
                      <span className="font-medium">{selectedIds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per employee</span>
                      <span className="font-medium">{formatRupees(amountPaise)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="font-semibold">Total deducted from company wallet</span>
                      <span className="font-bold text-primary">{formatRupees(totalToAllocate)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleAllocate}
                  disabled={allocating || selectedIds.length === 0}
                >
                  {allocating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending Credits…</>
                  ) : (
                    <><Gift className="mr-2 h-4 w-4" />Send {formatRupees(amountPaise)} to {selectedIds.length || '0'} Employee{selectedIds.length !== 1 ? 's' : ''}</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-muted-foreground text-xs">Total Allocated</p>
              <p className="text-xl font-bold mt-0.5">{formatRupees(summary.totalAllocatedPaise)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-muted-foreground text-xs">Total Transactions</p>
              <p className="text-xl font-bold mt-0.5">{summary.count}</p>
            </CardContent>
          </Card>
          {summary.byOccasion.slice(0, 2).map((o) => (
            <Card key={o.occasion}>
              <CardContent className="pt-5">
                <p className="text-muted-foreground text-xs">{occasionMeta(o.occasion).label}</p>
                <p className="text-xl font-bold mt-0.5">{formatRupees(o.totalPaise)}</p>
                <p className="text-xs text-muted-foreground">{o.count} gifts</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Allocation history table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocation History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingAllocs ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : allocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Gift className="h-8 w-8 mb-2" />
              <p className="text-sm">No credits allocated yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Allocated By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((a) => {
                  const occ = occasionMeta(a.occasion);
                  return (
                    <TableRow key={a._id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{a.employeeId?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{a.employeeId?.email || '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${occ.color}`}>
                          {occ.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {formatRupees(a.amountPaise)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                        {a.note || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.allocatedBy?.name || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreditAllocation;
