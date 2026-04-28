import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, FileText, Mail, MapPin, PackageCheck, SendHorizonal, Truck } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Header, Footer } from '@/components/home/';
import KitItemPreview from '@/components/kits/KitItemPreview';
import { useStore } from '@/contexts/StoreContext';
import { kitsApi } from '@/lib/kits';
import { RAW_API_URL } from '@/config';
import {
  buildKitSelections,
  getActiveKitVariants,
  getVariantColors,
  getVariantSizes,
  isValidKitVariantSelection,
  KitItemSelection,
  productRequiresVariantSelection,
  sumSelectionQuantityForProduct,
} from '@/lib/kitVariants';
import { Kit, KitProduct } from '@/types/kits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type OverageDecision = {
  catalogProductId: string;
  mode: 'order_full_moq';
};

type DeliveryMode = 'redeem' | 'surprise' | 'single_location';

type SingleLocationAddress = {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

const productFromItem = (item: any): KitProduct | undefined =>
  typeof item.catalogProductId === 'string' ? undefined : item.catalogProductId;

const parseEmails = (text: string) =>
  text
    .split(/[\n,;]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const BrandKitSendWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedStore } = useStore();
  const brandId = selectedStore?.id || (selectedStore as any)?._id;
  const [kit, setKit] = useState<Kit | null>(null);
  const [step, setStep] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('redeem');
  const [emailsText, setEmailsText] = useState('');
  const [surpriseRecipients, setSurpriseRecipients] = useState<any[]>([
    { recipientEmail: '', recipientName: '', address: {}, selections: [] },
  ]);
  const [singleLocationQuantity, setSingleLocationQuantity] = useState(1);
  const [singleLocationType, setSingleLocationType] = useState<'office' | 'event' | 'other'>('office');
  const [singleLocationAddress, setSingleLocationAddress] = useState<SingleLocationAddress>({
    fullName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [singleLocationNotes, setSingleLocationNotes] = useState('');
  const [singleLocationSelections, setSingleLocationSelections] = useState<KitItemSelection[]>([]);
  const [fromName, setFromName] = useState(selectedStore?.storeName || selectedStore?.name || '');
  const [message, setMessage] = useState('Thank you for being part of our team. Please redeem your gift.');
  const [sendInviteAt, setSendInviteAt] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledAt, setScheduledAt] = useState('');
  const [overageDecisions, setOverageDecisions] = useState<OverageDecision[]>([]);
  const [processing, setProcessing] = useState(false);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const response: any = await kitsApi.get(id);
        setKit(response.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load kit');
      }
    };
    load();
  }, [id]);

  const recipients = useMemo(() => parseEmails(emailsText), [emailsText]);
  const recipientCount = deliveryMode === 'single_location'
    ? Math.max(0, Number(singleLocationQuantity || 0))
    : deliveryMode === 'surprise'
      ? surpriseRecipients.filter((recipient) => recipient.recipientEmail).length
      : recipients.length;

  const moqWarnings = useMemo(() => {
    if (!kit || !recipientCount) return [];
    return kit.items
      .map((item) => {
        const product = productFromItem(item);
        const minimumQuantity = product?.stocks?.minimumQuantity || 1;
        if (!product || product.fulfillmentType !== 'inventory' || recipientCount >= minimumQuantity) return null;
        return {
          productId: product._id,
          productName: product.name,
          minimumQuantity,
          overageQty: minimumQuantity - recipientCount,
          accepted: overageDecisions.some((decision) => decision.catalogProductId === product._id),
        };
      })
      .filter(Boolean) as Array<{ productId: string; productName: string; minimumQuantity: number; overageQty: number; accepted: boolean }>;
  }, [kit, overageDecisions, recipientCount]);

  const kitProducts = useMemo(
    () => (kit?.items.map(productFromItem).filter(Boolean) || []) as KitProduct[],
    [kit]
  );
  const variantProducts = useMemo(() => kitProducts.filter(productRequiresVariantSelection), [kitProducts]);
  const fixedProducts = useMemo(() => kitProducts.filter((product) => !productRequiresVariantSelection(product)), [kitProducts]);
  const packagingProduct = useMemo(() => {
    const packaging = kit?.packaging;
    if (packaging?.mode !== 'catalog_product' || typeof packaging.catalogProductId === 'string') return null;
    return packaging.catalogProductId;
  }, [kit]);

  const surpriseSelectionsComplete = useMemo(() => {
    if (deliveryMode !== 'surprise') return true;
    const filledRecipients = surpriseRecipients.filter((recipient) => recipient.recipientEmail);
    if (!filledRecipients.length) return false;
    return filledRecipients.every((recipient) =>
      variantProducts.every((product) =>
        isValidKitVariantSelection(
          product,
          (recipient.selections || []).find((selection: KitItemSelection) => selection.catalogProductId === product._id)
        )
      )
    );
  }, [deliveryMode, surpriseRecipients, variantProducts]);

  const singleLocationComplete = useMemo(() => {
    if (deliveryMode !== 'single_location') return true;
    if (!recipientCount || !singleLocationAddress.fullName || !singleLocationAddress.address1 || !singleLocationAddress.city || !singleLocationAddress.country) {
      return false;
    }
    return variantProducts.every((product) =>
      sumSelectionQuantityForProduct(product._id, singleLocationSelections) === recipientCount &&
      singleLocationSelections
        .filter((selection) => selection.catalogProductId === product._id)
        .every((selection) => isValidKitVariantSelection(product, selection) && Number(selection.quantity || 0) > 0)
    );
  }, [deliveryMode, recipientCount, singleLocationAddress, singleLocationSelections, variantProducts]);

  const canAdvanceRecipients = recipientCount > 0 &&
    surpriseSelectionsComplete &&
    singleLocationComplete &&
    moqWarnings.every((warning) => warning.accepted);

  // Minimum schedule date = today + max production days across all kit items
  const minScheduleDate = useMemo(() => {
    const maxHours = kit?.items.reduce((max, item) => {
      const ph = productFromItem(item)?.productionHours || 120;
      return Math.max(max, ph);
    }, 120) ?? 120;
    const productionDays = Math.ceil(maxHours / 8);
    const d = new Date();
    d.setDate(d.getDate() + productionDays);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }, [kit]);

  const productQuantity = (product: KitProduct) => {
    if (deliveryMode !== 'single_location') return recipientCount;
    if (!productRequiresVariantSelection(product)) return recipientCount;
    return sumSelectionQuantityForProduct(product._id, singleLocationSelections);
  };

  const itemCostTotal = useMemo(() => {
    if (!kit || !recipientCount) return 0;
    return kit.items.reduce((sum, item) => {
      const product = productFromItem(item);
      if (!product) return sum;
      const quantity = Math.max(0, productQuantity(product));
      const minimumQuantity = product.stocks?.minimumQuantity || 1;
      const useMoq = product.fulfillmentType === 'inventory' && quantity < minimumQuantity &&
        overageDecisions.some((decision) => decision.catalogProductId === product._id);
      return sum + Number(product.basePrice || 0) * (useMoq ? minimumQuantity : quantity);
    }, 0);
  }, [deliveryMode, kit, overageDecisions, recipientCount, singleLocationSelections]);

  const packagingCost = Number(packagingProduct?.basePrice || 0) * recipientCount;
  const billableSubtotal = itemCostTotal + packagingCost;
  const serviceFee = billableSubtotal * 0.15;
  const tax = (billableSubtotal + serviceFee) * 0.18;
  const total = billableSubtotal + serviceFee + tax;

  const updateSurpriseRecipient = (index: number, patch: any) => {
    setSurpriseRecipients((current) => current.map((recipient, i) => i === index ? { ...recipient, ...patch } : recipient));
  };

  const updateRecipientSelection = (recipientIndex: number, product: KitProduct, patch: Partial<KitItemSelection>) => {
    setSurpriseRecipients((current) => current.map((recipient, index) => {
      if (index !== recipientIndex) return recipient;
      const selections = recipient.selections || [];
      const existing = selections.find((selection: KitItemSelection) => selection.catalogProductId === product._id);
      const nextSelection = {
        catalogProductId: product._id,
        quantity: 1,
        ...existing,
        ...patch,
      };
      if (patch.size && existing?.color) {
        const validColors = getVariantColors(product, patch.size);
        if (!validColors.includes(existing.color)) {
          nextSelection.color = '';
        }
      }
      const withoutProduct = selections.filter((selection: KitItemSelection) => selection.catalogProductId !== product._id);
      return { ...recipient, selections: [...withoutProduct, nextSelection] };
    }));
  };

  const updateSingleLocationAddress = (patch: Partial<SingleLocationAddress>) => {
    setSingleLocationAddress((current) => ({ ...current, ...patch }));
  };

  const updateSingleLocationVariantQuantity = (product: KitProduct, size: string, color: string, quantity: number) => {
    setSingleLocationSelections((current) => {
      const withoutVariant = current.filter((selection) =>
        !(selection.catalogProductId === product._id && selection.size === size && selection.color === color)
      );
      if (!quantity || quantity < 1) return withoutVariant;
      return [
        ...withoutVariant,
        {
          catalogProductId: product._id,
          size,
          color,
          quantity,
        },
      ];
    });
  };

  const buildSurprisePayload = () => surpriseRecipients
    .filter((recipient) => recipient.recipientEmail)
    .map((recipient) => ({
      ...recipient,
      selections: buildKitSelections(kitProducts, recipient.selections || []),
    }));

  const buildSingleLocationSelections = () =>
    singleLocationSelections
      .filter((selection) => Number(selection.quantity || 0) > 0)
      .map((selection) => ({
        catalogProductId: selection.catalogProductId,
        size: selection.size,
        color: selection.color,
        quantity: Number(selection.quantity || 0),
      }));

  const payNow = async () => {
    if (!kit || !brandId) return;
    if (!canAdvanceRecipients) {
      toast.error('Resolve delivery requirements before checkout');
      setStep(2);
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        kitId: kit._id,
        brandId,
        deliveryMode,
        recipientEmails: deliveryMode === 'redeem' ? recipients : [],
        surpriseRecipients: deliveryMode === 'surprise' ? buildSurprisePayload() : [],
        singleLocationQuantity: deliveryMode === 'single_location' ? recipientCount : undefined,
        singleLocationType: deliveryMode === 'single_location' ? singleLocationType : undefined,
        singleLocationAddress: deliveryMode === 'single_location' ? singleLocationAddress : undefined,
        singleLocationNotes: deliveryMode === 'single_location' ? singleLocationNotes : undefined,
        singleLocationSelections: deliveryMode === 'single_location' ? buildSingleLocationSelections() : undefined,
        fromName,
        message,
        sendInviteAt,
        scheduledAt: sendInviteAt === 'scheduled' ? scheduledAt : undefined,
        overageDecisions,
      };
      const response: any = await kitsApi.createSendOrder(payload);
      const { kitSend, razorpayOrder, razorpayKeyId } = response.data;

      if (!window.Razorpay) {
        toast.error('Razorpay checkout is not loaded. Please refresh and try again.');
        return;
      }

      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ShelfMerch',
        description: `${kit.name} send`,
        order_id: razorpayOrder.id,
        handler: async (paymentResponse: any) => {
          await kitsApi.verifySendOrder({
            kitSendId: kitSend._id,
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          });
          toast.success('Kit send paid and created');
          navigate(`/brand/kits/${kit._id}`);
        },
        prefill: {
          name: fromName,
        },
        theme: {
          color: '#22c55e',
        },
      });

      checkout.on('payment.failed', (event: any) => {
        toast.error(event?.error?.description || 'Payment failed');
      });
      checkout.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create kit send');
    } finally {
      setProcessing(false);
    }
  };

  const downloadKitQuotation = async () => {
    if (!kit || !brandId) return;
    if (!canAdvanceRecipients) {
      toast.error('Resolve delivery requirements before checkout');
      setStep(2);
      return;
    }
    setQuoting(true);
    try {
      const token = localStorage.getItem('token');
      const items = kitProducts.map((product) => ({
        catalogProductId: product._id,
        productName: product.name,
        quantity: recipientCount,
        unitPrice: Number(product.basePrice || 0),
        uploadedDesignUrls: kit.items
          .filter((item) => typeof item.catalogProductId !== 'string' && item.catalogProductId._id === product._id)
          .map((item) => item.uploadedLogoUrl)
          .filter(Boolean),
      }));
      const res = await fetch(`${RAW_API_URL}/api/quotations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items,
          deliveryMode: 'single_address',
          shippingInfo: deliveryMode === 'single_location' ? singleLocationAddress : undefined,
          deliveryNote: `${kit.name} kit send quotation. Delivery mode: ${deliveryMode}. ${singleLocationNotes || ''}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create quotation');
      const pdf = await fetch(`${RAW_API_URL}/api/quotation-pdf/${data.data.orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!pdf.ok) throw new Error('Failed to download quotation PDF');
      const blob = await pdf.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${data.data.quotationNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(`Quotation ${data.data.quotationNumber} downloaded. Find it in Draft Orders.`);
      navigate('/brand/draft-orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download quotation');
    } finally {
      setQuoting(false);
    }
  };

  const steps = [
    { label: 'Items', icon: PackageCheck },
    { label: 'Delivery', icon: Mail },
    { label: 'Experience', icon: CalendarClock },
    { label: 'Checkout', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <Button variant="ghost" className="px-0" asChild>
            <Link to={kit ? `/brand/kits/${kit._id}` : '/brand/kits'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Send Items</h1>
              <p className="mt-2 text-sm text-muted-foreground">{kit?.name || 'Loading kit'} campaign setup</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/brand/kits">Save and exit</Link>
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <Progress value={(step / 4) * 100} />
              <div className="grid gap-3 md:grid-cols-4">
                {steps.map((entry, index) => {
                  const Icon = entry.icon;
                  const active = step === index + 1;
                  const done = step > index + 1;
                  return (
                    <button
                      key={entry.label}
                      type="button"
                      onClick={() => setStep(index + 1)}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left ${active ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Icon className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground">Step {index + 1}</div>
                        <div className="font-medium">{entry.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {step === 1 && kit && (
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {kit.items.map((item) => {
                  const product = productFromItem(item);
                  return (
                    <div key={product?._id || String(item.catalogProductId)} className="space-y-3 rounded-xl border p-4">
                      <KitItemPreview product={product} logoUrl={item.uploadedLogoUrl} />
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Production time</span>
                          <span className="font-medium">{Math.ceil((product?.productionHours || 120) / 8)} working days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fulfillment</span>
                          <Badge variant="outline">{product?.fulfillmentType === 'inventory' ? 'Inventory' : 'Print on demand'}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
              <div className="flex justify-end px-6 pb-6">
                <Button onClick={() => setStep(2)}>Next</Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={deliveryMode} onValueChange={(value: DeliveryMode) => setDeliveryMode(value)} className="grid gap-4 lg:grid-cols-3">
                  <label className={`rounded-xl border p-4 ${deliveryMode === 'redeem' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="redeem" />
                      <div>
                        <div className="font-semibold">Recipients Redeem</div>
                        <p className="mt-1 text-sm text-muted-foreground">Recipients choose size, color, and shipping address for applicable products from a private link.</p>
                      </div>
                    </div>
                  </label>
                  <label className={`rounded-xl border p-4 ${deliveryMode === 'surprise' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="surprise" />
                      <div>
                        <div className="font-semibold">Surprise Recipients</div>
                        <p className="mt-1 text-sm text-muted-foreground">Enter recipient details up front so the gift can ship without recipient input.</p>
                      </div>
                    </div>
                  </label>
                  <label className={`rounded-xl border p-4 ${deliveryMode === 'single_location' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="single_location" />
                      <div>
                        <div className="font-semibold">Single Location</div>
                        <p className="mt-1 text-sm text-muted-foreground">Ship all kit units to one office, event venue, or single address.</p>
                      </div>
                    </div>
                  </label>
                </RadioGroup>

                {deliveryMode === 'redeem' ? (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emails">Emails</Label>
                      <Textarea
                        id="emails"
                        value={emailsText}
                        onChange={(event) => setEmailsText(event.target.value)}
                        placeholder="person@company.com&#10;teammate@company.com"
                        rows={8}
                      />
                      <p className="text-sm text-muted-foreground">{recipients.length} recipient{recipients.length === 1 ? '' : 's'} parsed</p>
                    </div>
                  </div>
                ) : deliveryMode === 'surprise' ? (
                  <div className="space-y-4">
                    {surpriseRecipients.map((recipient, index) => (
                      <div key={index} className="grid gap-3 rounded-xl border p-4 md:grid-cols-3">
                        <Input placeholder="Email" value={recipient.recipientEmail} onChange={(event) => updateSurpriseRecipient(index, { recipientEmail: event.target.value })} />
                        <Input placeholder="Name" value={recipient.recipientName} onChange={(event) => updateSurpriseRecipient(index, { recipientName: event.target.value })} />
                        <Input placeholder="Phone" value={recipient.address?.phone || ''} onChange={(event) => updateSurpriseRecipient(index, { address: { ...recipient.address, phone: event.target.value } })} />
                        <Input placeholder="Address" value={recipient.address?.address1 || ''} onChange={(event) => updateSurpriseRecipient(index, { address: { ...recipient.address, address1: event.target.value } })} />
                        <Input placeholder="City" value={recipient.address?.city || ''} onChange={(event) => updateSurpriseRecipient(index, { address: { ...recipient.address, city: event.target.value } })} />
                        <Input placeholder="State" value={recipient.address?.state || ''} onChange={(event) => updateSurpriseRecipient(index, { address: { ...recipient.address, state: event.target.value } })} />
                        <Input placeholder="Zip code" value={recipient.address?.zipCode || ''} onChange={(event) => updateSurpriseRecipient(index, { address: { ...recipient.address, zipCode: event.target.value } })} />
                        <div className="space-y-3 md:col-span-3">
                          <div className="text-sm font-semibold">Item choices</div>
                          {variantProducts.map((product) => {
                            const selection = (recipient.selections || []).find((entry: KitItemSelection) => entry.catalogProductId === product._id);
                            const sizes = getVariantSizes(product);
                            const colors = getVariantColors(product, selection?.size);
                            return (
                              <div key={product._id} className="grid gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-[1fr_160px_160px] md:items-center">
                                <div>
                                  <div className="text-sm font-medium">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">Size and color required</div>
                                </div>
                                <select
                                  className="h-10 rounded-md border bg-background px-3"
                                  value={selection?.size || ''}
                                  onChange={(event) => updateRecipientSelection(index, product, { size: event.target.value })}
                                >
                                  <option value="">Select size</option>
                                  {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                                </select>
                                <select
                                  className="h-10 rounded-md border bg-background px-3"
                                  value={selection?.color || ''}
                                  onChange={(event) => updateRecipientSelection(index, product, { color: event.target.value })}
                                  disabled={!selection?.size}
                                >
                                  <option value="">Select color</option>
                                  {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                                </select>
                              </div>
                            );
                          })}
                          {fixedProducts.map((product) => (
                            <div key={product._id} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-muted-foreground">No size/color needed</span>
                            </div>
                          ))}
                          {!variantProducts.length && (
                            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                              No kit items need size or color.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setSurpriseRecipients((current) => [...current, { recipientEmail: '', recipientName: '', address: {}, selections: [] }])}>
                      Add recipient
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="single-location-quantity">Total quantity</Label>
                        <Input
                          id="single-location-quantity"
                          type="number"
                          min={1}
                          value={singleLocationQuantity}
                          onChange={(event) => setSingleLocationQuantity(Math.max(0, Number(event.target.value || 0)))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="single-location-type">Location type</Label>
                        <select
                          id="single-location-type"
                          className="h-10 w-full rounded-md border bg-background px-3"
                          value={singleLocationType}
                          onChange={(event) => setSingleLocationType(event.target.value as 'office' | 'event' | 'other')}
                        >
                          <option value="office">Office address</option>
                          <option value="event">Event location</option>
                          <option value="other">Other single location</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        No redemption links are created for this mode.
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-3">
                      <Input placeholder="Contact name" value={singleLocationAddress.fullName} onChange={(event) => updateSingleLocationAddress({ fullName: event.target.value })} />
                      <Input placeholder="Contact email" value={singleLocationAddress.email} onChange={(event) => updateSingleLocationAddress({ email: event.target.value })} />
                      <Input placeholder="Phone" value={singleLocationAddress.phone} onChange={(event) => updateSingleLocationAddress({ phone: event.target.value })} />
                      <Input placeholder="Address" value={singleLocationAddress.address1} onChange={(event) => updateSingleLocationAddress({ address1: event.target.value })} />
                      <Input placeholder="Address line 2" value={singleLocationAddress.address2} onChange={(event) => updateSingleLocationAddress({ address2: event.target.value })} />
                      <Input placeholder="City" value={singleLocationAddress.city} onChange={(event) => updateSingleLocationAddress({ city: event.target.value })} />
                      <Input placeholder="State" value={singleLocationAddress.state} onChange={(event) => updateSingleLocationAddress({ state: event.target.value })} />
                      <Input placeholder="Zip code" value={singleLocationAddress.zipCode} onChange={(event) => updateSingleLocationAddress({ zipCode: event.target.value })} />
                      <Input placeholder="Country" value={singleLocationAddress.country} onChange={(event) => updateSingleLocationAddress({ country: event.target.value })} />
                      <Textarea
                        className="md:col-span-3"
                        placeholder="Delivery notes, event timing, loading dock instructions, or office floor"
                        rows={3}
                        value={singleLocationNotes}
                        onChange={(event) => setSingleLocationNotes(event.target.value)}
                      />
                    </div>

                    <div className="space-y-3 rounded-xl border p-4">
                      <div>
                        <div className="font-semibold">Item quantity breakdown</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Variant products must add up to {recipientCount || 0} unit{recipientCount === 1 ? '' : 's'} each.
                        </p>
                      </div>
                      {variantProducts.map((product) => {
                        const productTotal = sumSelectionQuantityForProduct(product._id, singleLocationSelections);
                        return (
                          <div key={product._id} className="space-y-3 rounded-lg border bg-muted/20 p-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="text-sm font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">Choose quantities by available size and color.</div>
                              </div>
                              <Badge variant={productTotal === recipientCount ? 'default' : 'outline'}>
                                {productTotal}/{recipientCount || 0}
                              </Badge>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                              {getActiveKitVariants(product).map((variant) => {
                                const existing = singleLocationSelections.find((selection) =>
                                  selection.catalogProductId === product._id &&
                                  selection.size === variant.size &&
                                  selection.color === variant.color
                                );
                                return (
                                  <label key={`${product._id}-${variant.size}-${variant.color}`} className="grid grid-cols-[1fr_96px] items-center gap-3 rounded-md border bg-background p-2 text-sm">
                                    <span>{variant.size} / {variant.color}</span>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={existing?.quantity || ''}
                                      placeholder="0"
                                      onChange={(event) => updateSingleLocationVariantQuantity(product, variant.size, variant.color, Number(event.target.value || 0))}
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {fixedProducts.map((product) => (
                        <div key={product._id} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-muted-foreground">Quantity: {recipientCount || 0}, no size/color needed</span>
                        </div>
                      ))}
                      {!variantProducts.length && (
                        <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                          No kit items need size or color. Every selected item will ship in the total quantity above.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {moqWarnings.map((warning) => (
                  <div key={warning.productId} className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">
                      Warning: {warning.productName} requires a minimum order of {warning.minimumQuantity}.
                    </p>
                    <p className="mt-1">You are sending to {recipientCount} recipients.</p>
                    <div className="mt-3 space-y-2">
                      <p>Options:</p>
                      <p>Increase recipients to {warning.minimumQuantity}+</p>
                      <button
                        type="button"
                        onClick={() => setOverageDecisions((current) => current.some((decision) => decision.catalogProductId === warning.productId)
                          ? current
                          : [...current, { catalogProductId: warning.productId, mode: 'order_full_moq' }]
                        )}
                        className="rounded-md border border-amber-500 bg-white px-3 py-2 font-medium text-amber-900"
                      >
                        Order full MOQ ({warning.minimumQuantity} units), {warning.overageQty} extra held in inventory
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="flex justify-end px-6 pb-6">
                <Button onClick={() => setStep(3)} disabled={!canAdvanceRecipients}>Next</Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From</Label>
                    <Input id="from-name" value={fromName} onChange={(event) => setFromName(event.target.value)} placeholder="Google People Team" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" maxLength={1500} rows={8} value={message} onChange={(event) => setMessage(event.target.value)} />
                    <p className="text-right text-xs text-muted-foreground">{message.length}/1500</p>
                  </div>
                  <RadioGroup value={sendInviteAt} onValueChange={(value: 'immediate' | 'scheduled') => setSendInviteAt(value)} className="space-y-3">
                    <label className="flex items-center gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="immediate" />
                      <span>Immediately after payment</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="scheduled" />
                      <span>Schedule invite</span>
                    </label>
                  </RadioGroup>
                  {sendInviteAt === 'scheduled' && (
                    <Input
                      type="date"
                      value={scheduledAt}
                      min={minScheduleDate}
                      onChange={(event) => setScheduledAt(event.target.value)}
                    />
                  )}
                </div>
                <div className="rounded-xl border bg-muted/30 p-5">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Preview</div>
                  <div className="mt-4 rounded-lg bg-background p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">From: {fromName || 'Your company'}</p>
                    <p className="mt-3 text-sm">{message}</p>
                    <Button className="mt-5 w-full" size="sm">Redeem gift</Button>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end px-6 pb-6">
                <Button onClick={() => setStep(4)}>Next</Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Complete payment to create this send, reserve MOQ overages, and prepare fulfillment.
                  </p>
                  <Button className="w-full" size="lg" onClick={payNow} disabled={processing || !recipientCount}>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Pay now
                  </Button>
                  <Button className="w-full" size="lg" variant="outline" onClick={downloadKitQuotation} disabled={processing || quoting || !recipientCount}>
                    <FileText className="mr-2 h-4 w-4" />
                    Download Quotation
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>{deliveryMode === 'single_location' ? 'Kit units' : 'Recipients'}</span>
                    <span>{recipientCount}</span>
                  </div>
                  <div className="flex justify-between"><span>Kit item cost</span><span>₹{itemCostTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Packaging cost</span><span>₹{packagingCost.toFixed(2)}</span></div>
                  {overageDecisions.length > 0 && (
                    <div className="flex justify-between text-amber-700"><span>MOQ overage cost</span><span>Included above</span></div>
                  )}
                  <div className="flex justify-between"><span>Service fee</span><span>₹{serviceFee.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Estimated tax</span><span>₹{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                  {overageDecisions.length > 0 && (
                    <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                      MOQ overage items are recorded on this send for later inventory handling.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </div>
  );
};

export default BrandKitSendWizard;
