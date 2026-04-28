import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ImagePlus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Header, Footer } from '@/components/home/';
import KitItemPreview from '@/components/kits/KitItemPreview';
import { useStore } from '@/contexts/StoreContext';
import { RAW_API_URL } from '@/config';
import { uploadKitLogo, kitsApi } from '@/lib/kits';
import { Kit, KitProduct } from '@/types/kits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

type DraftItem = {
  catalogProductId: string;
  uploadedLogoUrl: string;
  product?: KitProduct;
};

const BrandKitBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { selectedStore } = useStore();
  const brandId = selectedStore?.id || (selectedStore as any)?._id;
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'draft' | 'live'>('draft');
  const [catalogProducts, setCatalogProducts] = useState<KitProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<DraftItem[]>([]);
  const [packaging, setPackaging] = useState<{
    mode: 'none' | 'catalog_product';
    catalogProductId: string;
    branding: 'none' | 'logo' | 'custom';
    notes: string;
  }>({ mode: 'none', catalogProductId: '', branding: 'none', notes: '' });
  const [sampleRequested, setSampleRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${RAW_API_URL}/api/products?limit=100&isActive=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await response.json();
        if (json.success) {
          setCatalogProducts(json.data || []);
        }
      } catch {
        toast.error('Failed to load catalog products');
      }
    };

    load();
  }, [token]);

  useEffect(() => {
    const loadKit = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response: any = await kitsApi.get(id);
        const kit: Kit = response.data;
        setName(kit.name);
        setStatus(kit.status === 'live' ? 'live' : 'draft');
        setSampleRequested(Boolean((kit as any).sampleRequested));
        const kitPackaging = kit.packaging;
        setPackaging({
          mode: kitPackaging?.mode || 'none',
          catalogProductId: typeof kitPackaging?.catalogProductId === 'string'
            ? kitPackaging.catalogProductId
            : kitPackaging?.catalogProductId?._id || '',
          branding: kitPackaging?.branding || 'none',
          notes: kitPackaging?.notes || '',
        });
        setSelectedItems(
          kit.items.map((item) => ({
            catalogProductId: typeof item.catalogProductId === 'string' ? item.catalogProductId : item.catalogProductId._id,
            uploadedLogoUrl: item.uploadedLogoUrl,
            product: typeof item.catalogProductId === 'string' ? undefined : item.catalogProductId,
          }))
        );
      } catch (error: any) {
        toast.error(error.message || 'Failed to load kit');
      } finally {
        setLoading(false);
      }
    };

    loadKit();
  }, [id]);

  useEffect(() => {
    if (!catalogProducts.length) return;
    setSelectedItems((current) =>
      current.map((item) => ({
        ...item,
        product: item.product || catalogProducts.find((product) => product._id === item.catalogProductId),
      }))
    );
  }, [catalogProducts]);

  const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item.catalogProductId)), [selectedItems]);
  const merchandiseProducts = useMemo(() => catalogProducts.filter((product) => product.categoryId !== 'packaging'), [catalogProducts]);
  const packagingProducts = useMemo(() => catalogProducts.filter((product) => product.categoryId === 'packaging'), [catalogProducts]);
  const hasSampleAvailable = useMemo(() => selectedItems.some((item) => (item.product as any)?.sampleAvailable), [selectedItems]);

  const toggleProduct = (product: KitProduct) => {
    setSelectedItems((current) => {
      if (current.some((item) => item.catalogProductId === product._id)) {
        return current.filter((item) => item.catalogProductId !== product._id);
      }
      return [...current, { catalogProductId: product._id, uploadedLogoUrl: '', product }];
    });
  };

  const handleLogoUpload = async (productId: string, file?: File | null) => {
    if (!file) return;
    try {
      const url = await uploadKitLogo(file);
      setSelectedItems((current) =>
        current.map((item) =>
          item.catalogProductId === productId ? { ...item, uploadedLogoUrl: url } : item
        )
      );
      toast.success('Logo uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo');
    }
  };

  const saveKit = async (nextStatus: 'draft' | 'live') => {
    if (!brandId) {
      toast.error('Select a brand store first');
      return;
    }
    if (!name.trim()) {
      toast.error('Kit name is required');
      setStep(1);
      return;
    }
    if (!selectedItems.length) {
      toast.error('Add at least one product to the kit');
      setStep(2);
      return;
    }
    if (packaging.mode === 'catalog_product' && !packaging.catalogProductId) {
      toast.error('Choose a packaging product or select no packaging');
      setStep(4);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        brandId,
        name: name.trim(),
        status: nextStatus,
        items: selectedItems.map((item) => ({
          catalogProductId: item.catalogProductId,
          uploadedLogoUrl: item.uploadedLogoUrl,
        })),
        packaging: {
          mode: packaging.mode,
          catalogProductId: packaging.mode === 'catalog_product' ? packaging.catalogProductId : undefined,
          branding: packaging.mode === 'catalog_product' ? packaging.branding : 'none',
          notes: packaging.notes,
        },
        sampleRequested,
      };

      const response: any = isEditMode && id
        ? await kitsApi.update(id, payload)
        : await kitsApi.create(payload);

      toast.success(nextStatus === 'live' ? 'Kit published' : 'Kit saved as draft');
      navigate(`/brand/kits/${response.data._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save kit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" className="mb-3 px-0" asChild>
                <Link to={isEditMode && id ? `/brand/kits/${id}` : '/brand/kits'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <h1 className="text-3xl font-semibold">{isEditMode ? 'Edit kit' : 'Create a Kit'}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Name the kit, pick products from the catalog, then upload one brand logo per item.
              </p>
            </div>
            <Badge className={status === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
              {status}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {['Name the kit', 'Choose products', 'Upload logos', 'Packaging'].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index + 1)}
                className={`rounded-lg border px-4 py-3 text-left ${step === index + 1 ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {index + 1}</div>
                <div className="mt-1 font-medium">{label}</div>
              </button>
            ))}
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Name the kit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kit-name">Kit name</Label>
                  <Input
                    id="kit-name"
                    placeholder="New hire welcome kit"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)}>Continue</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Browse catalog</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {merchandiseProducts.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => toggleProduct(product)}
                    className={`overflow-hidden rounded-xl border text-left transition ${selectedIds.has(product._id) ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/50'}`}
                  >
                    <KitItemPreview product={product} className="rounded-none border-0" />
                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          {(product as any).sampleAvailable && <Badge variant="outline" className="mt-2">Sample available</Badge>}
                        </div>
                        {selectedIds.has(product._id) && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{Number(product.basePrice || 0).toFixed(2)} each
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
              <div className="flex items-center justify-between px-6 pb-6">
                <div className="text-sm text-muted-foreground">{selectedItems.length} selected</div>
                <Button onClick={() => setStep(3)} disabled={!selectedItems.length}>Continue</Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Upload brand logos</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                {selectedItems.map((item) => (
                  <div key={item.catalogProductId} className="rounded-xl border p-4">
                    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                      <KitItemPreview product={item.product} logoUrl={item.uploadedLogoUrl} />
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">{item.product?.name || 'Selected product'}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Upload the logo that should appear on this item in the kit preview and send flow.
                          </p>
                        </div>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                          <Upload className="h-4 w-4" />
                          <span>{item.uploadedLogoUrl ? 'Replace logo' : 'Upload logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => handleLogoUpload(item.catalogProductId, event.target.files?.[0])}
                          />
                        </label>
                        {item.uploadedLogoUrl && (
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            <ImagePlus className="h-4 w-4" />
                            Logo uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="flex flex-wrap justify-end gap-3 px-6 pb-6">
                <Button onClick={() => setStep(4)} disabled={!selectedItems.length}>
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Packaging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPackaging((current) => ({ ...current, mode: 'none', catalogProductId: '', branding: 'none' }))}
                    className={`rounded-xl border p-4 text-left transition ${packaging.mode === 'none' ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">No packaging needed</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Send items without a selected kit box, pouch, or cover.</p>
                      </div>
                      {packaging.mode === 'none' && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  </button>

                  {packagingProducts.map((product) => {
                    const selected = packaging.mode === 'catalog_product' && packaging.catalogProductId === product._id;
                    const primaryImage = product.galleryImages?.find((image) => image.isPrimary)?.url || product.galleryImages?.[0]?.url;
                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => setPackaging((current) => ({ ...current, mode: 'catalog_product', catalogProductId: product._id }))}
                        className={`overflow-hidden rounded-xl border text-left transition ${selected ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/50'}`}
                      >
                        <div className="aspect-square bg-white">
                          {primaryImage ? (
                            <img src={primaryImage} alt={product.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No preview</div>
                          )}
                        </div>
                        <div className="space-y-2 border-t p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                            </div>
                            {selected && <Check className="h-5 w-5 text-primary" />}
                          </div>
                          <div className="text-sm text-muted-foreground">₹{Number(product.basePrice || 0).toFixed(2)} per kit</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {packaging.mode === 'catalog_product' && (
                  <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-[240px_1fr]">
                    <div className="space-y-2">
                      <Label>Branding</Label>
                      <select
                        className="h-10 w-full rounded-md border bg-background px-3"
                        value={packaging.branding}
                        onChange={(event) => setPackaging((current) => ({ ...current, branding: event.target.value as any }))}
                      >
                        <option value="none">No branding</option>
                        <option value="logo">Use uploaded logo</option>
                        <option value="custom">Custom packaging branding</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Packaging notes</Label>
                      <Textarea
                        value={packaging.notes}
                        onChange={(event) => setPackaging((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="Add presentation or packing instructions"
                      />
                    </div>
                  </div>
                )}

                {!packagingProducts.length && (
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    No packaging products are active yet. Add products in the Packaging category from the superadmin catalog to show them here.
                  </div>
                )}
                {hasSampleAvailable && (
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <h3 className="font-semibold">Request a sample kit first?</h3>
                      <p className="text-sm text-muted-foreground">ShelfMerch can fulfill a sample kit before you send this campaign to recipients.</p>
                    </div>
                    <Button
                      type="button"
                      variant={sampleRequested ? 'default' : 'outline'}
                      onClick={() => setSampleRequested((value) => !value)}
                    >
                      {sampleRequested ? 'Sample requested' : 'Yes, send me a sample'}
                    </Button>
                  </div>
                )}
              </CardContent>
              <div className="flex flex-wrap justify-end gap-3 px-6 pb-6">
                <Button variant="outline" onClick={() => saveKit('draft')} disabled={loading}>
                  Save as draft
                </Button>
                <Button onClick={() => saveKit('live')} disabled={loading}>
                  Publish kit
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </div>
  );
};

export default BrandKitBuilder;
