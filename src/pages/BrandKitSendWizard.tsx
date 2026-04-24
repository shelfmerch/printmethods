import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, Mail, PackageCheck, SendHorizonal, Truck } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Header, Footer } from '@/components/home/';
import KitItemPreview from '@/components/kits/KitItemPreview';
import { useStore } from '@/contexts/StoreContext';
import { kitsApi } from '@/lib/kits';
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

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const colorOptions = ['Black', 'White', 'Navy', 'Blue', 'Grey'];

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
  const [deliveryMode, setDeliveryMode] = useState<'redeem' | 'surprise'>('redeem');
  const [emailsText, setEmailsText] = useState('');
  const [globalQty, setGlobalQty] = useState(1);
  const [surpriseRecipients, setSurpriseRecipients] = useState<any[]>([
    { recipientEmail: '', recipientName: '', address: {}, selections: [] },
  ]);
  const [fromName, setFromName] = useState(selectedStore?.storeName || selectedStore?.name || '');
  const [message, setMessage] = useState('Thank you for being part of our team. Please redeem your gift.');
  const [sendInviteAt, setSendInviteAt] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledAt, setScheduledAt] = useState('');
  const [overageDecisions, setOverageDecisions] = useState<OverageDecision[]>([]);
  const [processing, setProcessing] = useState(false);

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
  const recipientCount = deliveryMode === 'surprise' ? surpriseRecipients.filter((recipient) => recipient.recipientEmail).length : recipients.length;

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

  const canAdvanceRecipients = recipientCount > 0 && moqWarnings.every((warning) => warning.accepted);

  const itemCostTotal = useMemo(() => {
    if (!kit || !recipientCount) return 0;
    return kit.items.reduce((sum, item) => {
      const product = productFromItem(item);
      if (!product) return sum;
      const minimumQuantity = product.stocks?.minimumQuantity || 1;
      const useMoq = product.fulfillmentType === 'inventory' && recipientCount < minimumQuantity &&
        overageDecisions.some((decision) => decision.catalogProductId === product._id);
      return sum + Number(product.basePrice || 0) * (useMoq ? minimumQuantity : recipientCount);
    }, 0);
  }, [kit, overageDecisions, recipientCount]);

  const serviceFee = itemCostTotal * 0.15;
  const tax = (itemCostTotal + serviceFee) * 0.18;
  const total = itemCostTotal + serviceFee + tax;

  const updateSurpriseRecipient = (index: number, patch: any) => {
    setSurpriseRecipients((current) => current.map((recipient, i) => i === index ? { ...recipient, ...patch } : recipient));
  };

  const buildSurprisePayload = () => surpriseRecipients
    .filter((recipient) => recipient.recipientEmail)
    .map((recipient) => ({
      ...recipient,
      selections: kit?.items.map((item) => {
        const product = productFromItem(item);
        return {
          catalogProductId: product?._id,
          color: recipient.color || 'Black',
          size: recipient.size || 'M',
          quantity: 1,
        };
      }).filter((entry) => entry.catalogProductId) || [],
    }));

  const payNow = async () => {
    if (!kit || !brandId) return;
    if (!canAdvanceRecipients) {
      toast.error('Resolve MOQ requirements before checkout');
      setStep(2);
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        kitId: kit._id,
        brandId,
        deliveryMode,
        recipientEmails: recipients,
        surpriseRecipients: buildSurprisePayload(),
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

  const steps = [
    { label: 'Items', icon: PackageCheck },
    { label: 'Recipients', icon: Mail },
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
                <CardTitle>Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={deliveryMode} onValueChange={(value: 'redeem' | 'surprise') => setDeliveryMode(value)} className="grid gap-4 md:grid-cols-2">
                  <label className={`rounded-xl border p-4 ${deliveryMode === 'redeem' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="redeem" />
                      <div>
                        <div className="font-semibold">Recipients Redeem</div>
                        <p className="mt-1 text-sm text-muted-foreground">Recipients choose size, color, and shipping address from a private link.</p>
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
                </RadioGroup>

                {deliveryMode === 'redeem' ? (
                  <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                    <div className="space-y-2">
                      <Label htmlFor="global-qty">Global quantity</Label>
                      <Input id="global-qty" type="number" min={1} value={globalQty} onChange={(event) => setGlobalQty(Number(event.target.value) || 1)} />
                    </div>
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
                ) : (
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
                        <select className="h-10 rounded-md border bg-background px-3" value={recipient.size || 'M'} onChange={(event) => updateSurpriseRecipient(index, { size: event.target.value })}>
                          {sizeOptions.map((size) => <option key={size}>{size}</option>)}
                        </select>
                        <select className="h-10 rounded-md border bg-background px-3" value={recipient.color || 'Black'} onChange={(event) => updateSurpriseRecipient(index, { color: event.target.value })}>
                          {colorOptions.map((color) => <option key={color}>{color}</option>)}
                        </select>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setSurpriseRecipients((current) => [...current, { recipientEmail: '', recipientName: '', address: {}, selections: [] }])}>
                      Add recipient
                    </Button>
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
                    <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
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
                    Complete payment to create the send, reserve MOQ overages, and create recipient redemption links.
                  </p>
                  <Button className="w-full" size="lg" onClick={payNow} disabled={processing || !recipientCount}>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Pay now
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Recipients</span><span>{recipientCount}</span></div>
                  <div className="flex justify-between"><span>Items cost</span><span>₹{itemCostTotal.toFixed(2)}</span></div>
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
