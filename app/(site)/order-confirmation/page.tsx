'use client';

import { PaymentPanel } from '@/components/payment-panel';
import type { ApiResponse, TrackedOrder } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const raw = sessionStorage.getItem('wto_last_order');
        if (!raw) return;

        const saved: { order_number: string; email: string } = JSON.parse(raw);
        setEmail(saved.email);

        const res = await fetch('/api/orders/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved),
        });
        const json: ApiResponse<TrackedOrder> = await res.json();
        if (json.success) setOrder(json.data);
      } catch {
        // falls through to the "not found" message
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-350 px-6 md:px-10 py-24 text-center">
        <p className="text-umber">Loading your order...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-350 px-6 md:px-10 py-24 md:py-32 text-center">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Order</p>
        <h1 className="font-display font-light text-3xl md:text-4xl text-espresso">We couldn&apos;t load your order.</h1>
        <p className="mt-4 text-umber">If you placed an order, you can find it with your order number and email.</p>
        <Link
          href="/track-order"
          className="stitch-underline font-mono-label text-[12px] uppercase text-espresso inline-block mt-8"
        >
          Track Order
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-350 px-6 md:px-10 py-12 md:py-16">
      <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Order Placed</p>
      <h1 className="font-display font-light text-3xl md:text-4xl text-espresso mb-2">Thank you, {order.order_number}</h1>
      <p className="text-umber mb-10 max-w-2xl">
        Your order is reserved. Send the bank transfer using the details below, then upload your receipt. You can also do
        this later from{' '}
        <Link href="/track-order" className="stitch-underline text-espresso">
          Track Order
        </Link>{' '}
        with your order number and email.
      </p>

      <div className="grid">
        <PaymentPanel order={order} email={email} onSubmitted={() => setOrder({ ...order, status: 'payment_review' })} />
      </div>
    </main>
  );
}
