import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RAW_API_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShoppingBag, MapPin, Globe, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  catalogProductId: string;
  productName: string;
  variantId?: string;
  color: string;
  colorHex?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  decorationMethodId?: string;
  decorationMethodName?: string;
  uploadedDesignUrls?: string[];
  primaryImage?: string;
}

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Australia', 'New Zealand',
  'Canada', 'Singapore', 'UAE', 'Germany', 'France', 'Japan', 'Taiwan',
];

const DirectCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<'single_address' | 'multi_country'>('single_address');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: '', email: '', phone: '',
    address1: '', address2: '', city: '',
    state: '', zipCode: '', country: 'India',
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('catalogCart');
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('returnTo', '/direct-checkout');
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setShipping(prev => ({
        ...prev,
        fullName: prev.fullName || (user as any).name || '',
        email: prev.email || (user as any).email || '',
        phone: prev.phone || (user as any).phone || '',
      }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const toggleCountry = (c: string) => {
    setSelectedCountries(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const loadRazorpay = (): Promise<boolean> =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    if (deliveryMode === 'single_address') {
      if (!shipping.fullName || !shipping.email || !shipping.address1 || !shipping.city) {
        toast.error('Please fill all required shipping fields');
        return;
      }
    } else {
      if (selectedCountries.length === 0) {
        toast.error('Select at least one delivery country');
        return;
      }
    }

    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Could not load payment gateway'); return; }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${RAW_API_URL}/api/direct-orders/razorpay/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(i => ({
            catalogProductId: i.catalogProductId,
            productName: i.productName,
            variantId: i.variantId,
            color: i.color,
            colorHex: i.colorHex,
            size: i.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            decorationMethodId: i.decorationMethodId,
            decorationMethodName: i.decorationMethodName,
            uploadedDesignUrls: i.uploadedDesignUrls || [],
          })),
          shippingInfo: deliveryMode === 'single_address' ? shipping : undefined,
          deliveryMode,
          deliveryCountries: deliveryMode === 'multi_country' ? selectedCountries : [],
          deliveryNote,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) throw new Error(orderData.message);

      const { orderId, razorpayOrderId, razorpayKeyId, amount, currency } = orderData.data;

      new window.Razorpay({
        key: razorpayKeyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'ShelfMerch',
        description: `Bulk order — ${totalQty} items`,
        prefill: {
          name: shipping.fullName || (user as any)?.name,
          email: shipping.email || (user as any)?.email,
          contact: shipping.phone || (user as any)?.phone,
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${RAW_API_URL}/api/direct-orders/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId,
                razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.message);

            sessionStorage.removeItem('catalogCart');
            setDone(true);
            toast.success('Order placed successfully!');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
        theme: { color: '#000000' },
      }).open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create order');
      setPlacing(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-6">
              Your order for {totalQty} items has been placed. We'll be in touch shortly.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => navigate('/products')}>Order More</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0 && !done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <Button onClick={() => navigate('/products')}>Browse Catalog</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT — Form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Delivery mode */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Delivery Option</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMode('single_address')}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                    deliveryMode === 'single_address'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Single Address</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ship everything to one location
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMode('multi_country')}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                    deliveryMode === 'multi_country'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Globe className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Multiple Countries</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Distribute globally — we'll coordinate
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Address form */}
            {deliveryMode === 'single_address' && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Full Name *</Label>
                    <Input
                      value={shipping.fullName}
                      onChange={e => setShipping(s => ({ ...s, fullName: e.target.value }))}
                      placeholder="Jane Smith"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Phone</Label>
                    <Input
                      value={shipping.phone}
                      onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={shipping.email}
                      onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                      placeholder="jane@company.com"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address Line 1 *</Label>
                    <Input
                      value={shipping.address1}
                      onChange={e => setShipping(s => ({ ...s, address1: e.target.value }))}
                      placeholder="Building, Street"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address Line 2</Label>
                    <Input
                      value={shipping.address2}
                      onChange={e => setShipping(s => ({ ...s, address2: e.target.value }))}
                      placeholder="Area, Landmark (optional)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={shipping.city}
                      onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                      placeholder="Mumbai"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={shipping.state}
                      onChange={e => setShipping(s => ({ ...s, state: e.target.value }))}
                      placeholder="Maharashtra"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>ZIP / Postal Code</Label>
                    <Input
                      value={shipping.zipCode}
                      onChange={e => setShipping(s => ({ ...s, zipCode: e.target.value }))}
                      placeholder="400001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <select
                      value={shipping.country}
                      onChange={e => setShipping(s => ({ ...s, country: e.target.value }))}
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-country selector */}
            {deliveryMode === 'multi_country' && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold mb-1">Select Delivery Countries</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select all countries where recipients are located. Our team will coordinate distribution.
                </p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCountry(c)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                        selectedCountries.includes(c)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <Label>Additional Notes</Label>
                  <textarea
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. 50 to India, 20 to Australia, 30 to USA — let us know any preferences"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-6 sticky top-6">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    {item.primaryImage ? (
                      <img
                        src={item.primaryImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.color} · {item.size} · ×{item.quantity}
                      </p>
                      {item.decorationMethodName && (
                        <p className="text-xs text-gray-400">{item.decorationMethodName}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium flex-shrink-0">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({totalQty} pcs)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-400">Calculated after order</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full mt-5 h-12 text-base"
              >
                {placing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Pay ₹{subtotal.toFixed(2)}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DirectCheckout;
