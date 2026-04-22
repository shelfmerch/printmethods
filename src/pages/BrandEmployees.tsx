import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/contexts/StoreContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  UserPlus,
  Trash2,
  Loader2,
  RefreshCw,
  Upload,
  Download,
  Search,
  Users,
  Wallet,
  ToggleLeft,
  ToggleRight,
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

interface BrandEmployee {
  _id: string;
  email: string;
  name?: string;
  department?: string;
  employeeId?: string;
  inviteStatus: 'pending' | 'active' | 'deactivated';
  totalCreditAllocatedPaise: number;
  totalCreditUsedPaise: number;
  userId?: { name: string; email: string };
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  deactivated: 'bg-red-100 text-red-800',
};

const formatRupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const BrandEmployees = () => {
  const { selectedStore } = useStore();
  const [employees, setEmployees] = useState<BrandEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Single add form state
  const [form, setForm] = useState({ email: '', name: '', department: '', employeeId: '' });
  const [adding, setAdding] = useState(false);

  // Bulk CSV state
  const [csvText, setCsvText] = useState('');
  const [bulkAdding, setBulkAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandId = selectedStore?.id || (selectedStore as any)?._id;
  const token = localStorage.getItem('token');

  const fetchEmployees = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-employees/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEmployees(data.data);
      else toast.error(data.message || 'Failed to load employees');
    } catch {
      toast.error('Network error loading employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [brandId]);

  const filtered = employees.filter(
    (e) =>
      e.email.includes(search.toLowerCase()) ||
      (e.name?.toLowerCase().includes(search.toLowerCase())) ||
      (e.department?.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Single Add ──────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) { toast.error('No active brand store found. Please create one first.'); return; }
    if (!form.email.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-employees/${brandId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`${form.email} added`);
      setForm({ email: '', name: '', department: '', employeeId: '' });
      setAddDialogOpen(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  // ── Bulk CSV Add ─────────────────────────────────────────────────────────────
  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n').slice(1); // skip header
    return lines
      .map((l) => {
        const [email, name, department] = l.split(',').map((s) => s.trim());
        return email ? { email, name, department } : null;
      })
      .filter(Boolean);
  };

  const handleBulkAdd = async () => {
    if (!brandId) { toast.error('No active brand store found. Please create one first.'); return; }
    const employeesPayload = parseCsv(csvText);
    if (!employeesPayload.length) {
      toast.error('No valid employees found. Check CSV format.');
      return;
    }
    setBulkAdding(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-employees/${brandId}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employees: employeesPayload }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const { added, skipped, errors } = data.data;
      toast.success(`Added: ${added}, Skipped: ${skipped}${errors.length ? `, Errors: ${errors.length}` : ''}`);
      setCsvText('');
      setBulkDialogOpen(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Bulk add failed');
    } finally {
      setBulkAdding(false);
    }
  };

  const downloadSampleCsv = () => {
    const csv = 'email,name,department\nalice@company.com,Alice Johnson,Engineering\nbob@company.com,Bob Smith,Marketing\ncarol@company.com,Carol Lee,HR';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string);
    reader.readAsText(file);
  };

  // ── Toggle Status ────────────────────────────────────────────────────────────
  const handleToggleStatus = async (emp: BrandEmployee) => {
    const newStatus = emp.inviteStatus === 'active' ? 'deactivated' : 'active';
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-employees/${brandId}/${emp._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`Employee ${newStatus}`);
      setEmployees((prev) =>
        prev.map((e) => (e._id === emp._id ? { ...e, inviteStatus: newStatus } : e))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // ── Remove ───────────────────────────────────────────────────────────────────
  const handleRemove = async (emp: BrandEmployee) => {
    if (!confirm(`Remove ${emp.email} from this brand? Their credit balance will remain on their wallet.`)) return;
    try {
      const res = await fetch(`${RAW_API_URL}/api/brand-employees/${brandId}/${emp._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Employee removed');
      setEmployees((prev) => prev.filter((e) => e._id !== emp._id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove employee');
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.inviteStatus === 'active').length,
    pending: employees.filter((e) => e.inviteStatus === 'pending').length,
    totalAllocated: employees.reduce((s, e) => s + e.totalCreditAllocatedPaise, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage who can order from your swag store and allocate credits.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Bulk Upload */}
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Add Employees (CSV)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="text-sm text-muted-foreground bg-muted rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">CSV Format:</p>
                    <button
                      onClick={downloadSampleCsv}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Download className="h-3 w-3" /> Download Sample
                    </button>
                  </div>
                  <code className="text-xs">email,name,department</code>
                  <br />
                  <code className="text-xs">alice@company.com,Alice,Engineering</code>
                </div>
                <div className="space-y-2">
                  <Label>Upload CSV file</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose CSV File
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Or paste CSV text</Label>
                  <textarea
                    className="w-full border rounded-md p-2 text-sm font-mono h-32 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={`email,name,department\nalice@company.com,Alice,Engineering\nbob@company.com,Bob,Marketing`}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleBulkAdd} disabled={bulkAdding || !csvText.trim()}>
                  {bulkAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload {csvText ? `(~${parseCsv(csvText).length} employees)` : ''}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Single Add */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="empEmail">Work Email *</Label>
                  <Input
                    id="empEmail"
                    type="email"
                    placeholder="employee@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="empName">Name</Label>
                    <Input
                      id="empName"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empDept">Department</Label>
                    <Input
                      id="empDept"
                      placeholder="e.g. Engineering"
                      value={form.department}
                      onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empId">Employee ID (optional)</Label>
                  <Input
                    id="empId"
                    placeholder="HR system ID"
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={adding}>
                  {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Add Employee
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users },
          { label: 'Active', value: stats.active, icon: Users },
          { label: 'Pending', value: stats.pending, icon: UserPlus },
          { label: 'Credits Allocated', value: formatRupees(stats.totalAllocated), icon: Wallet },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                  <p className="text-xl font-bold mt-0.5">{s.value}</p>
                </div>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by email, name, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No employees yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add employees individually or bulk-upload a CSV.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Employee List ({filtered.length}{filtered.length !== employees.length ? ` of ${employees.length}` : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits Allocated</TableHead>
                  <TableHead>Credits Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{emp.name || emp.userId?.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                        {emp.employeeId && (
                          <p className="text-xs text-muted-foreground">ID: {emp.employeeId}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{emp.department || '—'}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatRupees(emp.totalCreditAllocatedPaise)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRupees(emp.totalCreditUsedPaise)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[emp.inviteStatus]}`}>
                        {emp.inviteStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={emp.inviteStatus === 'active' ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(emp)}
                        >
                          {emp.inviteStatus === 'active' ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(emp)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
};

export default BrandEmployees;
