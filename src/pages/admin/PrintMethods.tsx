import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RAW_API_URL } from '@/config';

const METHOD_CODES = [
  { value: 'dtf',         label: 'DTF (Direct to Film)' },
  { value: 'screen',      label: 'Screen Printing' },
  { value: 'sublimation', label: 'Sublimation' },
  { value: 'embroidery',  label: 'Embroidery' },
  { value: 'laser',       label: 'Laser Engraving' },
  { value: 'dtg',         label: 'DTG (Direct to Garment)' },
  { value: 'uv_print',    label: 'UV Printing' },
];

const SEED_DEFAULTS: Record<string, Partial<PrintMethodForm>> = {
  dtf:         { baseRatePaisePerSqIn: 300, hasColors: false, colorRatePaise: 0, minColors: 1, maxColors: 0, moq: 1, note: 'Full-color digital print. Heat press at 160°C for 15 seconds.' },
  screen:      { baseRatePaisePerSqIn: 500, hasColors: true,  colorRatePaise: 4000, minColors: 1, maxColors: 8, moq: 50, note: 'First color included in base. Each additional color adds setup cost.' },
  sublimation: { baseRatePaisePerSqIn: 400, hasColors: false, colorRatePaise: 0, minColors: 1, maxColors: 0, moq: 1, note: 'Full-color, all-over print. Polyester/light fabrics only.' },
  embroidery:  { baseRatePaisePerSqIn: 800, hasColors: true,  colorRatePaise: 2500, minColors: 1, maxColors: 12, moq: 10, note: 'Thread stitching. First thread color included.' },
  laser:       { baseRatePaisePerSqIn: 600, hasColors: false, colorRatePaise: 0, minColors: 0, maxColors: 0, moq: 1, note: 'For hard goods: keychains, metal bottles, awards.' },
  dtg:         { baseRatePaisePerSqIn: 350, hasColors: false, colorRatePaise: 0, minColors: 1, maxColors: 0, moq: 1, note: 'Direct-to-garment inkjet. Works on cotton.' },
  uv_print:    { baseRatePaisePerSqIn: 700, hasColors: false, colorRatePaise: 0, minColors: 1, maxColors: 0, moq: 1, note: 'UV-cured print on rigid substrates.' },
};

interface PrintMethod {
  _id: string;
  name: string;
  code: string;
  sequence: number;
  active: boolean;
  baseRatePaisePerSqIn: number;
  hasColors: boolean;
  colorRatePaise: number;
  minColors: number;
  maxColors: number;
  moq: number;
  note?: string;
  description?: string;
}

interface PrintMethodForm {
  name: string;
  code: string;
  sequence: number;
  active: boolean;
  baseRatePaisePerSqIn: number;
  hasColors: boolean;
  colorRatePaise: number;
  minColors: number;
  maxColors: number;
  moq: number;
  note: string;
  description: string;
}

const EMPTY_FORM: PrintMethodForm = {
  name: '', code: '', sequence: 10, active: true,
  baseRatePaisePerSqIn: 0, hasColors: true, colorRatePaise: 0,
  minColors: 1, maxColors: 0, moq: 1, note: '', description: '',
};

const paise = (v: number) => `₹${(v / 100).toFixed(2)}`;

export default function PrintMethods() {
  const [methods, setMethods] = useState<PrintMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrintMethod | null>(null);
  const [form, setForm] = useState<PrintMethodForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${RAW_API_URL}/api/print-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMethods(data.data);
    } catch { toast.error('Failed to load print methods'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMethods(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (m: PrintMethod) => {
    setEditing(m);
    setForm({
      name: m.name, code: m.code, sequence: m.sequence, active: m.active,
      baseRatePaisePerSqIn: m.baseRatePaisePerSqIn, hasColors: m.hasColors,
      colorRatePaise: m.colorRatePaise, minColors: m.minColors, maxColors: m.maxColors,
      moq: m.moq, note: m.note || '', description: m.description || '',
    });
    setDialogOpen(true);
  };

  const handleCodeChange = (code: string) => {
    const label = METHOD_CODES.find(c => c.value === code)?.label || '';
    const defaults = SEED_DEFAULTS[code] || {};
    setForm(f => ({ ...f, code, name: label, ...defaults }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code) { toast.error('Name and code required'); return; }
    setSaving(true);
    try {
      const url = editing
        ? `${RAW_API_URL}/api/print-methods/${editing._id}`
        : `${RAW_API_URL}/api/print-methods`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(editing ? 'Updated' : 'Print method created');
      setDialogOpen(false);
      fetchMethods();
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (m: PrintMethod) => {
    if (!confirm(`Delete "${m.name}"? This will unlink it from products.`)) return;
    try {
      const res = await fetch(`${RAW_API_URL}/api/print-methods/${m._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Deleted');
      setMethods(prev => prev.filter(x => x._id !== m._id));
    } catch (err: any) { toast.error(err.message || 'Failed to delete'); }
  };

  const toggleActive = async (m: PrintMethod) => {
    try {
      const res = await fetch(`${RAW_API_URL}/api/print-methods/${m._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !m.active }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMethods(prev => prev.map(x => x._id === m._id ? data.data : x));
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
  };

  // Live price preview
  const previewPrice = () => {
    const area = 12; // 3×4 inch example
    const colors = form.hasColors ? 3 : 1;
    const areaCharge = form.baseRatePaisePerSqIn * area;
    const colorCharge = form.hasColors ? form.colorRatePaise * Math.max(0, colors - form.minColors) : 0;
    return paise(areaCharge + colorCharge);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Print Methods</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Define printing methods, rates, and MOQ. Assign per product in product settings.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Method</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Print Method' : 'New Print Method'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              {/* Code + Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Method Type *</Label>
                  <Select value={form.code} onValueChange={handleCodeChange} disabled={!!editing}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {METHOD_CODES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Display Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Base Rate (paise/sq.in)</Label>
                  <Input type="number" min={0} value={form.baseRatePaisePerSqIn}
                    onChange={e => setForm(f => ({ ...f, baseRatePaisePerSqIn: +e.target.value }))} />
                  <p className="text-xs text-muted-foreground">{paise(form.baseRatePaisePerSqIn)}/sq.in</p>
                </div>
                <div className="space-y-1.5">
                  <Label>MOQ (min units)</Label>
                  <Input type="number" min={1} value={form.moq}
                    onChange={e => setForm(f => ({ ...f, moq: +e.target.value }))} />
                </div>
              </div>

              {/* Color pricing */}
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Charge per color?</Label>
                  <Switch checked={form.hasColors}
                    onCheckedChange={v => setForm(f => ({ ...f, hasColors: v }))} />
                </div>
                {form.hasColors && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Rate/color (paise)</Label>
                      <Input type="number" min={0} value={form.colorRatePaise}
                        onChange={e => setForm(f => ({ ...f, colorRatePaise: +e.target.value }))} />
                      <p className="text-xs text-muted-foreground">{paise(form.colorRatePaise)}/color</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Included colors</Label>
                      <Input type="number" min={0} value={form.minColors}
                        onChange={e => setForm(f => ({ ...f, minColors: +e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max colors (0=∞)</Label>
                      <Input type="number" min={0} value={form.maxColors}
                        onChange={e => setForm(f => ({ ...f, maxColors: +e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>

              {/* Price preview */}
              <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Example (12 sq.in, 3 colors): </span>
                <span className="font-semibold">{previewPrice()} per piece</span>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Production Note (ops team)</Label>
                <Textarea rows={2} value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Heat press at 160°C for 15 seconds" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input type="number" min={1} value={form.sequence}
                    onChange={e => setForm(f => ({ ...f, sequence: +e.target.value }))} />
                </div>
                <div className="flex items-end gap-2 pb-0.5">
                  <Switch checked={form.active}
                    onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
                  <Label>{form.active ? 'Active' : 'Inactive'}</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Method'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : methods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="font-medium">No print methods yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add DTF, Screen Print, Embroidery etc. to get started.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add First Method</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {methods.map(m => (
            <Card key={m._id} className={!m.active ? 'opacity-60' : ''}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{m.name}</span>
                        <Badge variant="outline" className="text-xs">{m.code}</Badge>
                        {!m.active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex gap-3">
                        <span>{paise(m.baseRatePaisePerSqIn)}/sq.in</span>
                        {m.hasColors && <span>+{paise(m.colorRatePaise)}/color</span>}
                        <span>MOQ: {m.moq} units</span>
                        {m.maxColors > 0 && <span>Max {m.maxColors} colors</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={m.active} onCheckedChange={() => toggleActive(m)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}>
                      {expandedId === m._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === m._id && m.note && (
                <CardContent className="pt-0 pb-3 px-4">
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">{m.note}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
