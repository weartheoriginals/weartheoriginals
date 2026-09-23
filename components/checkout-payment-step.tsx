'use client';

import { convertFromUSD, formatCurrency, PAYMENT_CURRENCIES, type PaymentCurrency } from '@/lib/payment-config';
import { Check, Copy, Upload } from 'lucide-react';
import { useState } from 'react';

type Stage = 'currency' | 'instructions' | 'confirm' | 'received';

export default function CheckoutPaymentStep({
  totalUSD,
  reference,
  senderName,
  onBack,
}: {
  totalUSD: number;
  reference: string;
  senderName: string;
  onBack: () => void;
}) {
  const [stage, setStage] = useState<Stage>('currency');
  const [currency, setCurrency] = useState<PaymentCurrency>('USD');
  const [copied, setCopied] = useState(false);

  const cfg = PAYMENT_CURRENCIES[currency];
  const amount = convertFromUSD(totalUSD, currency);
  const amountLabel = formatCurrency(amount, currency);

  const [confirm, setConfirm] = useState({
    amount: '',
    sender: senderName,
    date: '',
    bankRef: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [confirmErrors, setConfirmErrors] = useState<Record<string, string>>({});

  const bankRows: [string, string][] = [
    ['Account holder', cfg.bank.accountHolder],
    ['Bank', cfg.bank.bankName],
    ['Account number', cfg.bank.accountNumber],
    [cfg.bank.routingLabel, cfg.bank.routingValue],
    ['SWIFT / BIC', cfg.bank.swift],
    ['Bank address', cfg.bank.bankAddress],
  ];

  async function copyDetails() {
    const text = [
      ...bankRows.map(([k, v]) => `${k}: ${v}`),
      `Amount: ${amountLabel}`,
      `Payment reference: ${reference}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function openConfirm() {
    setConfirm(c => ({ ...c, amount: amount.toFixed(2) }));
    setStage('confirm');
  }

  function submitConfirm() {
    const errs: Record<string, string> = {};
    if (!confirm.amount.trim()) errs.amount = 'Enter the amount you sent';
    if (!confirm.sender.trim()) errs.sender = 'Enter the sender name';
    if (!confirm.date) errs.date = 'Select the transfer date';
    if (!file) errs.file = 'Upload your payment receipt';
    setConfirmErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // Back-end hookup comes later: upload receipt + POST confirmation.
    setStage('received');
  }

  const inputClass =
    'w-full px-4 py-3 bg-ivory border text-sm text-espresso placeholder:text-umber/40 outline-none transition-colors focus:border-espresso';
  const labelClass = 'font-mono-label text-[11px] uppercase text-umber block mb-2';

  /* ---------- Stage: received ---------- */
  if (stage === 'received') {
    return (
      <div className="border border-espresso/20 bg-umber/5 p-8 md:p-10 text-center">
        <div className="w-12 h-12 rounded-full border border-espresso/30 flex items-center justify-center mx-auto mb-5">
          <Check className="w-5 h-5 text-espresso" />
        </div>
        <h3 className="font-display text-2xl text-espresso mb-3">Payment confirmation received.</h3>
        <p className="text-sm text-umber max-w-md mx-auto leading-relaxed">
          Your order is now awaiting payment verification. We&apos;ll confirm your order once the transfer has been received
          and verified.
        </p>
        <div className="mt-6 inline-flex gap-8 border-t border-espresso/10 pt-5">
          <div className="text-left">
            <p className="font-mono-label text-[10px] uppercase text-umber/70">Order</p>
            <p className="font-mono-label text-sm text-espresso">{reference}</p>
          </div>
          <div className="text-left">
            <p className="font-mono-label text-[10px] uppercase text-umber/70">Amount</p>
            <p className="font-mono-label text-sm text-espresso">{amountLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Stage: confirm form ---------- */
  if (stage === 'confirm') {
    return (
      <div>
        <h3 className="font-display text-xl text-espresso mb-2">Payment confirmation</h3>
        <p className="text-sm text-umber mb-6">
          Once you&apos;ve made the bank transfer, fill in the details and upload your payment receipt.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Order number</label>
            <input readOnly value={reference} className={`${inputClass} border-espresso/20 bg-umber/5`} />
          </div>
          <div>
            <label className={labelClass}>Payment reference (if used)</label>
            <input
              value={confirm.bankRef}
              onChange={e => setConfirm(c => ({ ...c, bankRef: e.target.value }))}
              placeholder={reference}
              className={`${inputClass} border-espresso/20`}
            />
          </div>
          <div>
            <label className={labelClass}>Amount sent</label>
            <input
              value={confirm.amount}
              onChange={e => {
                setConfirm(c => ({ ...c, amount: e.target.value }));
                setConfirmErrors(er => ({ ...er, amount: '' }));
              }}
              inputMode="decimal"
              className={`${inputClass} ${confirmErrors.amount ? 'border-red-400' : 'border-espresso/20'}`}
            />
            {confirmErrors.amount && <p className="text-xs text-red-500 mt-1.5">{confirmErrors.amount}</p>}
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input readOnly value={currency} className={`${inputClass} border-espresso/20 bg-umber/5`} />
          </div>
          <div>
            <label className={labelClass}>Sender name (as per bank)</label>
            <input
              value={confirm.sender}
              onChange={e => {
                setConfirm(c => ({ ...c, sender: e.target.value }));
                setConfirmErrors(er => ({ ...er, sender: '' }));
              }}
              className={`${inputClass} ${confirmErrors.sender ? 'border-red-400' : 'border-espresso/20'}`}
            />
            {confirmErrors.sender && <p className="text-xs text-red-500 mt-1.5">{confirmErrors.sender}</p>}
          </div>
          <div>
            <label className={labelClass}>Transfer date</label>
            <input
              type="date"
              value={confirm.date}
              onChange={e => {
                setConfirm(c => ({ ...c, date: e.target.value }));
                setConfirmErrors(er => ({ ...er, date: '' }));
              }}
              className={`${inputClass} ${confirmErrors.date ? 'border-red-400' : 'border-espresso/20'}`}
            />
            {confirmErrors.date && <p className="text-xs text-red-500 mt-1.5">{confirmErrors.date}</p>}
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass}>Upload receipt</label>
          <label
            className={`flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 cursor-pointer text-center transition-colors hover:border-espresso ${
              confirmErrors.file ? 'border-red-400' : 'border-espresso/30'
            }`}
          >
            <Upload className="w-5 h-5 text-umber" />
            <span className="text-sm text-espresso">{file ? file.name : 'Click to upload your receipt'}</span>
            <span className="text-xs text-umber/70">PDF, JPG, PNG · max 5MB</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0] ?? null;
                if (f && f.size > 5 * 1024 * 1024) {
                  setFile(null);
                  setConfirmErrors(er => ({ ...er, file: 'File must be under 5MB' }));
                  return;
                }
                setFile(f);
                setConfirmErrors(er => ({ ...er, file: '' }));
              }}
            />
          </label>
          {confirmErrors.file && <p className="text-xs text-red-500 mt-1.5">{confirmErrors.file}</p>}
        </div>

        <button
          type="button"
          onClick={submitConfirm}
          className="mt-6 block w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 text-center hover:bg-umber transition-colors"
        >
          Submit Payment
        </button>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setStage('instructions')}
            className="font-mono-label text-[11px] uppercase text-umber stitch-underline"
          >
            ← Back to payment details
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Stage: bank instructions ---------- */
  if (stage === 'instructions') {
    return (
      <div>
        <h3 className="font-display text-xl text-espresso mb-2">Bank Transfer</h3>
        <p className="text-sm text-umber mb-6 max-w-lg leading-relaxed">
          Pay securely by bank transfer using our international receiving accounts. Your order will be reserved while we
          verify the payment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-espresso/10 border border-espresso/10 mb-6">
          <div className="bg-ivory p-5">
            <p className="font-mono-label text-[10px] uppercase text-umber/70 mb-1">Amount to pay</p>
            <p className="font-display text-2xl text-espresso">{amountLabel}</p>
            <p className="font-mono-label text-[10px] uppercase text-umber/70 mt-1">Payment currency: {currency}</p>
          </div>
          <div className="bg-ivory p-5">
            <p className="font-mono-label text-[10px] uppercase text-umber/70 mb-1">Payment reference</p>
            <p className="font-display text-2xl text-espresso">{reference}</p>
            <p className="text-xs text-umber/70 mt-1">Include this with your transfer if your bank allows it.</p>
          </div>
        </div>

        <div className="border border-espresso/20 p-6 bg-umber/5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono-label text-[11px] uppercase text-brass">Bank details ({currency})</p>
            <button
              type="button"
              onClick={copyDetails}
              className="inline-flex items-center gap-2 bg-espresso text-ivory font-mono-label text-[11px] uppercase px-4 py-2.5 hover:bg-umber transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy account details'}
            </button>
          </div>
          <div className="space-y-2.5 border-t border-espresso/10 pt-4">
            {bankRows.map(([key, val]) => (
              <div key={key} className="flex gap-3 text-sm">
                <span className="font-mono-label text-[11px] uppercase text-umber/70 min-w-36 shrink-0 pt-0.5">{key}</span>
                <span className="text-espresso">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border border-brass/40 bg-brass/5 p-5">
          <p className="font-mono-label text-[11px] uppercase text-espresso mb-2">Important</p>
          <ul className="text-xs text-umber space-y-1.5 leading-relaxed list-disc pl-4">
            <li>
              Please transfer exactly <span className="text-espresso font-medium">{amountLabel}</span>.
            </li>
            <li>
              Use <span className="text-espresso font-medium">{reference}</span> as your payment reference if your bank
              allows it.
            </li>
            <li>Transfers may take 1–24 hours to reflect in our account.</li>
          </ul>
        </div>

        <div className="mt-6 border-t border-espresso/10 pt-6">
          <p className="text-sm text-umber mb-3">Already sent the payment?</p>
          <button
            type="button"
            onClick={openConfirm}
            className="block w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 text-center hover:bg-umber transition-colors"
          >
            I&apos;ve Made the Payment
          </button>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setStage('currency')}
              className="font-mono-label text-[11px] uppercase text-umber stitch-underline"
            >
              ← Change currency
            </button>
          </div>
        </div>

        <p className="text-xs text-umber/70 text-center mt-6">
          Your order is reserved while we verify your payment. · Secure payment · Worldwide delivery
        </p>
      </div>
    );
  }

  /* ---------- Stage: currency ---------- */
  return (
    <div>
      <h3 className="font-display text-xl text-espresso mb-2">Choose your payment currency</h3>
      <p className="text-sm text-umber mb-6">Select the currency in which you&apos;d like to pay.</p>

      <div className="space-y-3">
        {Object.values(PAYMENT_CURRENCIES).map(c => {
          const active = c.code === currency;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`w-full flex items-center justify-between gap-4 px-5 py-4 border text-left transition-colors ${
                active ? 'border-espresso bg-umber/5' : 'border-espresso/20 hover:border-espresso/50'
              }`}
            >
              <div>
                <p className="font-mono-label text-[12px] uppercase text-espresso">
                  {c.code} {c.symbol} <span className="text-umber/70 normal-case ml-1">{c.name}</span>
                </p>
                <p className="text-xs text-umber/70 mt-1">{c.hint}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono-label text-sm text-espresso">
                  {formatCurrency(convertFromUSD(totalUSD, c.code), c.code)}
                </span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    active ? 'border-espresso' : 'border-espresso/30'
                  }`}
                >
                  {active && <span className="w-2 h-2 rounded-full bg-espresso" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setStage('instructions')}
        className="mt-6 block w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 text-center hover:bg-umber transition-colors"
      >
        Continue · {amountLabel}
      </button>
      <div className="text-center mt-4">
        <button type="button" onClick={onBack} className="font-mono-label text-[11px] uppercase text-umber stitch-underline">
          ← Back to shipping
        </button>
      </div>
    </div>
  );
}
