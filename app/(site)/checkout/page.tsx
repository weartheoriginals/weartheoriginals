'use client';

import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string;
};

function Field({
  label,
  value,
  error,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-mono-label text-[11px] uppercase text-umber block mb-2">
        {label} {required && <span className="text-saddle">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-ivory border text-sm text-espresso placeholder:text-umber/40 outline-none transition-colors focus:border-espresso ${
          error ? 'border-red-400' : 'border-espresso/20'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState('');

  const shipping = subtotal >= 500 ? 0 : 25;
  const grandTotal = subtotal + shipping;

  function setField(name: keyof FormState, val: string) {
    setForm(f => ({ ...f, [name]: val }));
    setErrors(e => ({ ...e, [name]: '' }));
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = 'Enter a valid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;

    setPlacing(true);
    setServerError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postal_code: form.postal_code.trim(),
          notes: form.notes.trim(),
          payment_method: 'bank_transfer',
          items: items.map(item => ({
            slug: item.slug,
            quantity: item.quantity,
            customizations: item.customizations,
          })),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setServerError(data.error ?? 'Something went wrong. Please try again.');
        setPlacing(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation?order_number=${data.data.order_number}&order_id=${data.data.order_id}`);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-350 px-6 md:px-10 py-24 md:py-32 text-center">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Checkout</p>
        <h1 className="font-display font-light text-3xl md:text-4xl text-espresso">Your bag is empty.</h1>
        <p className="mt-4 text-umber">Add something before checking out.</p>
        <Link
          href="/c/jackets"
          className="stitch-underline font-mono-label text-[12px] uppercase text-espresso inline-block mt-8"
        >
          Shop Jackets
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-350 px-6 md:px-10 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/cart" className="font-mono-label text-[11px] uppercase text-umber stitch-underline">
          Cart
        </Link>
        <span className="text-umber/40 text-xs">/</span>
        <span className="font-mono-label text-[11px] uppercase text-espresso">Checkout</span>
      </div>

      <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Secure Checkout</p>
      <h1 className="font-display font-light text-3xl md:text-4xl text-espresso mb-10 md:mb-14">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        {/* Left: form */}
        <div className="lg:col-span-2 border-t border-espresso/10 pt-8">
          <h2 className="font-display text-xl text-espresso mb-6">Delivery Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="First Name"
              required
              value={form.first_name}
              error={errors.first_name}
              onChange={val => setField('first_name', val)}
              placeholder="Jane"
            />
            <Field
              label="Last Name"
              required
              value={form.last_name}
              error={errors.last_name}
              onChange={val => setField('last_name', val)}
              placeholder="Doe"
            />
            <Field
              label="Email"
              type="email"
              required
              value={form.email}
              error={errors.email}
              onChange={val => setField('email', val)}
              placeholder="jane@example.com"
            />
            <Field
              label="Phone Number"
              type="tel"
              required
              value={form.phone}
              error={errors.phone}
              onChange={val => setField('phone', val)}
              placeholder="+1 234 567 8901"
            />
            <div className="sm:col-span-2">
              <Field
                label="Full Address"
                required
                value={form.address}
                error={errors.address}
                onChange={val => setField('address', val)}
                placeholder="123 Main Street, Apt 4B"
              />
            </div>
            <Field
              label="City"
              required
              value={form.city}
              error={errors.city}
              onChange={val => setField('city', val)}
              placeholder="New York"
            />
            <Field
              label="Postal Code"
              value={form.postal_code}
              onChange={val => setField('postal_code', val)}
              placeholder="10001"
            />
          </div>

          <div className="mt-5">
            <label className="font-mono-label text-[11px] uppercase text-umber block mb-2">
              Order Notes <span className="text-umber/50 normal-case">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Delivery instructions, gift notes, etc."
              rows={3}
              className="w-full px-4 py-3 bg-ivory border border-espresso/20 text-sm text-espresso placeholder:text-umber/40 outline-none transition-colors focus:border-espresso resize-y"
            />
          </div>

          {/* Payment method — bank transfer only */}
          <div className="mt-10">
            <h2 className="font-display text-xl text-espresso mb-6">Payment</h2>

            <div className="border border-espresso/20 p-6 bg-umber/5">
              <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Bank Transfer</p>
              <p className="text-sm text-umber mb-5">
                Complete your payment via bank transfer using the details below, then send your receipt to confirm your
                order.
              </p>

              <div className="space-y-2.5 border-t border-espresso/10 pt-5">
                {[
                  ['Bank', 'Placeholder Bank Ltd.'],
                  ['Account Title', 'Wear The Originals'],
                  ['Account No', '0000-0000-0000'],
                  ['IBAN', 'XX00 0000 0000 0000 0000 0000'],
                ].map(([key, val]) => (
                  <div key={key} className="flex gap-3 text-sm">
                    <span className="font-mono-label text-[11px] uppercase text-umber/70 min-w-28 shrink-0 pt-0.5">
                      {key}
                    </span>
                    <span className="text-espresso">{val}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-umber mt-5 pt-5 border-t border-espresso/10 leading-relaxed">
                After payment, send your receipt to <span className="text-espresso font-medium">+00 000 0000000</span> on
                WhatsApp, or email <span className="text-espresso font-medium">orders@wear-the-originals.com</span>, to
                confirm your order.
              </p>
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-1">
          <div className="border-t border-espresso/10 pt-8 lg:sticky lg:top-8">
            <h2 className="font-display text-xl text-espresso mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.lineId} className="flex gap-4 items-center">
                  <div className="relative shrink-0 w-14 h-18 bg-umber/5 overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 bg-espresso text-ivory text-[10px] font-mono-label w-4.5 h-4.5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-espresso truncate">{item.name}</p>
                    {Object.keys(item.customizations).length > 0 && (
                      <p className="font-mono-label text-[10px] uppercase text-umber/60 mt-0.5 truncate">
                        {Object.values(item.customizations).join(' · ')}
                      </p>
                    )}
                  </div>
                  <p className="font-mono-label text-[13px] text-umber whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-espresso/10 pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono-label text-[11px] uppercase text-umber">Subtotal</span>
                <span className="font-mono-label text-sm text-espresso">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono-label text-[11px] uppercase text-umber">Shipping</span>
                <span className="font-mono-label text-sm text-espresso">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-umber/70 bg-umber/5 px-3 py-2">
                  Add {formatPrice(500 - subtotal)} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-espresso/10 mt-4 pt-4 flex items-center justify-between">
              <span className="font-display text-lg text-espresso">Total</span>
              <span className="font-display text-xl text-espresso">{formatPrice(grandTotal)}</span>
            </div>

            {serverError && (
              <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600">{serverError}</div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="mt-6 block w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 text-center hover:bg-umber transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {placing ? 'Placing Order…' : `Place Order · ${formatPrice(grandTotal)}`}
            </button>

            <p className="text-xs text-umber/70 text-center mt-4 leading-relaxed">
              By placing your order you agree to our terms. Send your payment receipt to confirm your order.
            </p>

            <div className="text-center mt-4">
              <Link href="/cart" className="font-mono-label text-[11px] uppercase text-umber stitch-underline">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
