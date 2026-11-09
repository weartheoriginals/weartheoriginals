'use client';

import { PAYMENT_CURRENCIES, formatCurrency } from '@/lib/payment-config';
import type { TrackedOrder } from '@/lib/types';
import { Copy, Upload } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function PaymentPanel({
  order,
  email,
  onSubmitted,
}: {
  order: TrackedOrder;
  email: string;
  onSubmitted: () => void;
}) {
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
