import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gift, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import KitItemPreview from '@/components/kits/KitItemPreview';
import { kitsApi } from '@/lib/kits';
import { KitProduct, KitRedemption } from '@/types/kits';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const colorOptions = ['Black', 'White', 'Navy', 'Blue', 'Grey'];

const KitRedeem = () => {
  const { token } = useParams<{ token: string }>();
  const [redemption, setRedemption] = useState<KitRedemption | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [address, setAddress] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response: any = await kitsApi.getByToken(token);
        setRedemption(response.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load gift');
      }
    };
    load();
  }, [token]);

  const kitSend = redemption?.kitSendId;
  const kit = kitSend?.kitId;
  const items = useMemo(() => kit?.items || [], [kit]);

  useEffect(() => {
    if (!items.length) return;
    setSelectedItems(items.map((item: any) => {
      const product: KitProduct = item.catalogProductId;
      return {
        catalogProductId: product._id,
        size: 'M',
        color: 'Black',
        quantity: 1,
      };
    }));
  }, [items]);

  const updateSelectedItem = (productId: string, patch: any) => {
    setSelectedItems((current) => current.map((item) => item.catalogProductId === productId ? { ...item, ...patch } : item));
  };

  const submit = async () => {
    if (!token) return;
    if (!address.fullName || !address.phone || !address.address1 || !address.city || !address.country) {
      toast.error('Complete the shipping address');
      return;
    }

    try {
      const response: any = await kitsApi.redeemByToken(token, {
        selectedItems,
        shippingAddress: address,
      });
      setRedemption(response.data);
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to redeem gift');
    }
  };

  if (!redemption) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center text-muted-foreground">Loading gift...</CardContent>
        </Card>
      </div>
    );
  }

  if (redemption.status === 'redeemed' || submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="space-y-4 p-8 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-semibold">You've already received this gift</h1>
            <p className="text-muted-foreground">Your choices and shipping address are saved.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redemption.status === 'closed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="space-y-4 p-8 text-center">
            <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">This gift link is no longer available</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Gift className="h-4 w-4" />
            ShelfMerch Gift
          </div>
          <h1 className="text-3xl font-semibold">{kit?.name || 'Your gift is ready'}</h1>
          <p className="max-w-2xl text-muted-foreground">
            {kitSend?.message || 'Choose your preferences and shipping address to receive your gift.'}
          </p>
          {kitSend?.fromName && <p className="text-sm text-muted-foreground">From {kitSend.fromName}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item: any) => {
              const product: KitProduct = item.catalogProductId;
              const selected = selectedItems.find((entry) => entry.catalogProductId === product._id);
              return (
                <Card key={product._id}>
                  <CardContent className="space-y-4 p-4">
                    <KitItemPreview product={product} logoUrl={item.uploadedLogoUrl} />
                    {kitSend.deliveryMode === 'redeem' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <select className="h-10 w-full rounded-md border bg-background px-3" value={selected?.size || 'M'} onChange={(event) => updateSelectedItem(product._id, { size: event.target.value })}>
                            {sizeOptions.map((size) => <option key={size}>{size}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <select className="h-10 w-full rounded-md border bg-background px-3" value={selected?.color || 'Black'} onChange={(event) => updateSelectedItem(product._id, { color: event.target.value })}>
                            {colorOptions.map((color) => <option key={color}>{color}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-semibold">Shipping address</h2>
              <div className="grid gap-3">
                <Input placeholder="Full name" value={address.fullName || ''} onChange={(event) => setAddress({ ...address, fullName: event.target.value })} />
                <Input placeholder="Phone" value={address.phone || ''} onChange={(event) => setAddress({ ...address, phone: event.target.value })} />
                <Input placeholder="Address" value={address.address1 || ''} onChange={(event) => setAddress({ ...address, address1: event.target.value })} />
                <Input placeholder="City" value={address.city || ''} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
                <Input placeholder="State" value={address.state || ''} onChange={(event) => setAddress({ ...address, state: event.target.value })} />
                <Input placeholder="ZIP / Postal code" value={address.zipCode || ''} onChange={(event) => setAddress({ ...address, zipCode: event.target.value })} />
                <Input placeholder="Country" value={address.country || ''} onChange={(event) => setAddress({ ...address, country: event.target.value })} />
              </div>
              <Button className="w-full" size="lg" onClick={submit}>
                Redeem gift
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default KitRedeem;
