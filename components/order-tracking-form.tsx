'use client';

import { formatCurrency, PAYMENT_CURRENCIES } from '@/lib/payment-config';
import type { ApiResponse, OrderStatus, TrackedOrder } from '@/lib/types';
import { CircleCheck, Copy, Mail, Package, Truck, Upload } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  awaiting_payment: 'We are waiting for your bank transfer. Send the payment, then upload your receipt below.',
  payment_review: 'We received your receipt and are verifying the payment. This can take up to 24 hours.',
  confirmed: 'Your order has been confirmed and will be processed shortly.',
  processing: 'Your order is being prepared.',
  dispatched: 'Your order has left our workshop.',
  in_transit: "Your order is on its way! It's currently in transit and expected to arrive soon.",
  delivered: 'Your order has been delivered.',
  cancelled: 'This order has been cancelled.',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OrderTrackingForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber, email }),
      });
      const json: ApiResponse<TrackedOrder> = await res.json();

      if (!json.success) {
        setError(json.error);
        setOrder(null);
      } else {
        setOrder(json.data);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const historyMap = new Map((order?.order_status_history ?? []).map(h => [h.status, h.happened_at]));
  const currentStageIndex = order ? STAGES.findIndex(s => s.key === order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: form */}
      <div className="border border-espresso/10 bg-white p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-6">Track Your Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-espresso/15 px-3 h-12">
            <Package className="w-4 h-4 text-umber/50 shrink-0" />
            <div className="flex-1">
              <label className="block text-[11px] text-umber/60">Order Number</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="e.g. OGNLS12345"
                className="w-full bg-transparent text-sm text-espresso placeholder:text-umber/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-espresso/15 px-3 h-12">
            <Mail className="w-4 h-4 text-umber/50 shrink-0" />
            <div className="flex-1">
              <label className="block text-[11px] text-umber/60">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-espresso placeholder:text-umber/40 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-espresso text-ivory font-mono-label text-[11px] uppercase tracking-wide hover:bg-espresso/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track Order →'}
          </button>
        </form>
      </div>

      {/* Right: status card */}
      <div className="border border-espresso/10 bg-[#f0ede7] p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-2">{order ? 'Order Status' : 'Order Status'}</h2>
        <p className="font-display text-xl text-espresso mb-6">
          {order ? `Order #${order.order_number}` : 'Enter your details to see status'}
        </p>

        <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 md:gap-0 mb-6">
          {STAGES.map((stage, i) => {
            const reached = order && !isCancelled && i <= currentStageIndex;
            const isCurrent = order && !isCancelled && i === currentStageIndex;
            const date = historyMap.get(stage.key);

            return (
              <div key={stage.key} className="flex md:flex-col items-center gap-3 md:gap-0 flex-1 relative">
                {i > 0 && (
                  <div
                    className={`hidden md:block absolute top-4 right-1/2 w-full h-px ${
                      reached ? 'bg-espresso' : 'bg-espresso/15'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    reached ? 'bg-espresso text-ivory' : 'bg-transparent border border-espresso/20 text-umber/30'
                  }`}
                >
                  {isCurrent ? (
                    <Truck className="w-4 h-4" />
                  ) : reached ? (
                    <CircleCheck className="w-4 h-4" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <div>
                  <p className="font-mono-label text-[10px] uppercase text-espresso md:mt-2 text-left md:text-center">
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-umber/50 mt-0.5">{date ? formatDate(date) : '—'}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 border border-espresso/10 bg-white p-4">
          <Truck className="w-4 h-4 text-umber/50 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-espresso font-medium">
              {order
                ? isCancelled
                  ? 'Order cancelled'
                  : order.status === 'awaiting_payment'
                    ? 'Waiting for your payment'
                    : order.status === 'payment_review'
                      ? 'Verifying your payment'
                      : currentStageIndex === STAGES.length - 1
                        ? 'Delivered!'
                        : 'Your order is on its way!'
                : 'No order looked up yet'}
            </p>
            <p className="text-xs text-umber/60 mt-1">
              {order ? STATUS_MESSAGES[order.status] : 'Enter your order number and email to see live status here.'}
            </p>
          </div>
        </div>
      </div>

      {order && (order.status === 'awaiting_payment' || order.status === 'payment_review') && (
        <PaymentPanel order={order} email={email} onSubmitted={() => setOrder({ ...order, status: 'payment_review' })} />
      )}
    </div>
  );
}

function PaymentPanel({ order, email, onSubmitted }: { order: TrackedOrder; email: string; onSubmitted: () => void }) {
  const [senderName, setSenderName] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currency = order.payment_currency;
  const cfg = currency ? PAYMENT_CURRENCIES[currency] : null;

  if (order.status === 'payment_review') {
    return (
      <div className="md:col-span-2 border border-espresso/10 bg-white p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-2">Payment Under Review</h2>
        <p className="text-sm text-umber/70">
          We received your receipt. We will confirm your order once the transfer is verified in our account.
        </p>
      </div>
    );
  }

  if (!cfg || !currency || order.payment_amount == null) return null;

  const amount = formatCurrency(order.payment_amount, currency);

  function copyDetails() {
    const text = [`Reference: ${order.order_number}`, ...cfg!.bank.map(r => `${r.label}: ${r.value}`)].join('\n');
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Please attach your receipt');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Receipt must be under 4 MB');
      return;
    }

    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append('order_number', order.order_number);
    fd.append('email', email);
    fd.append('sender_name', senderName);
    if (transferDate) fd.append('transfer_date', transferDate);
    fd.append('receipt', file);

    try {
      const res = await fetch('/api/orders/receipt', { method: 'POST', body: fd });
      const json: { success: boolean; error?: string } = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Something went wrong. Please try again.');
      } else {
        onSubmitted();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
      <div className="border border-espresso/10 bg-white p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-4">Bank Transfer Details</h2>
        <p className="text-sm text-umber/70 mb-1">Amount to pay</p>
        <p className="font-display text-2xl text-espresso mb-1">
          {amount} <span className="text-sm text-umber/60">{currency}</span>
        </p>
        <p className="text-xs text-umber/60 mb-6">
          Payment reference: <span className="text-espresso font-medium">{order.order_number}</span>. Please include it with
          your transfer if your bank allows it.
        </p>

        <dl className="space-y-3 mb-6">
          {cfg.bank.map(row => (
            <div key={row.label}>
              <dt className="text-[11px] text-umber/60">{row.label}</dt>
              <dd className="text-sm text-espresso">{row.value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={copyDetails}
          className="w-full h-12 border border-espresso text-espresso font-mono-label text-[11px] uppercase tracking-wide hover:bg-espresso hover:text-ivory transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied' : 'Copy details'}
        </button>
      </div>

      <div className="border border-espresso/10 bg-white p-8">
        <h2 className="font-mono-label text-[11px] uppercase text-brass mb-2">Already Paid?</h2>
        <p className="text-sm text-umber/70 mb-6">Upload your receipt so we can verify the transfer.</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border border-espresso/15 px-3 h-12 flex flex-col justify-center">
            <label className="block text-[11px] text-umber/60">Sender name</label>
            <input
              type="text"
              required
              maxLength={120}
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              className="w-full bg-transparent text-sm text-espresso focus:outline-none"
            />
          </div>

          <div className="border border-espresso/15 px-3 h-12 flex flex-col justify-center">
            <label className="block text-[11px] text-umber/60">Transfer date (optional)</label>
            <input
              type="date"
              value={transferDate}
              onChange={e => setTransferDate(e.target.value)}
              className="w-full bg-transparent text-sm text-espresso focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-3 border border-dashed border-espresso/25 px-3 h-12 cursor-pointer">
            <Upload className="w-4 h-4 text-umber/50 shrink-0" />
            <span className="text-sm text-espresso truncate">
              {file ? file.name : 'Choose receipt (JPG, PNG or PDF, up to 4 MB)'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-espresso text-ivory font-mono-label text-[11px] uppercase tracking-wide hover:bg-espresso/90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Uploading...' : 'Submit Payment'}
          </button>

          <p className="text-xs text-umber/60">
            Trouble uploading? Send the receipt on WhatsApp with your order number {order.order_number}.
          </p>
        </form>
      </div>
    </div>
  );
}
