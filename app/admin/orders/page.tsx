'use client';

import { CANCELLABLE, FILTER_TABS, NEXT_STEP, STATUS_LABELS, STATUS_STYLES, paymentState } from '@/lib/order-status';
import { createBrowserClient } from '@supabase/ssr';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface OrderRow {
  id: string;
  order_number: string | null;
  full_name: string;
  email: string;
  status: string | null;
  total_amount: number;
  payment_currency: string | null;
  payment_amount: number | null;
  created_at: string;
  payment_submitted_at: string | null;
  item_count: number;
}

interface OrderItem {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  variants: string[];
  quantity: number;
  unit_price: number;
}

interface OrderDetail {
  id: string;
  order_number: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  shipping_address: Record<string, unknown> | null;
  status: string | null;
  total_amount: number;
  shipping_amount: number;
  notes: string | null;
  created_at: string;
  payment_currency: string | null;
  payment_amount: number | null;
  exchange_rate: number | null;
  sender_name: string | null;
  transfer_date: string | null;
  receipt_path: string | null;
  payment_submitted_at: string | null;
  receipt_url: string | null;
  items: OrderItem[];
  history: { status: string; happened_at: string }[];
}

function createSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

async function authFetch(url: string, init?: { method?: string; body?: string }) {
  const supabase = createSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  return res.json();
}

function money(amount: number | string | null | undefined, currency = 'USD', fixed = false) {
  if (amount === null || amount === undefined) return '—';
  const n = Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: fixed || !Number.isInteger(n) ? 2 : 0,
  }).format(n);
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string | null }) {
  const key = status ?? 'pending';
  return (
    <span
      className={`inline-block px-2 py-1 font-mono-label text-[0.65rem] uppercase tracking-wider whitespace-nowrap ${
        STATUS_STYLES[key] ?? 'bg-stone-100 text-stone-700'
      }`}
    >
      {STATUS_LABELS[key] ?? key}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-(--hairline) bg-ivory">
      <div className="px-4 py-3 border-b border-(--hairline)">
        <h3 className="font-mono-label text-xs uppercase tracking-widest text-umber">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-umber capitalize shrink-0">{label}</span>
      <span className="text-espresso text-right wrap-break-word min-w-0">{children}</span>
    </div>
  );
}

function OrderPanel({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const json = await authFetch(`/api/admin/orders/${id}`);
      if (json.success) setDetail(json.data);
      else setError(json.error ?? 'Failed to load order');
    } catch {
      setError('Failed to load order');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function changeStatus(next: string, message: string) {
    if (!window.confirm(message)) return;
    setBusy(true);
    setError('');
    try {
      const json = await authFetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      if (!json.success) {
        setError(json.error ?? 'Update failed');
      } else {
        await load();
        onChanged();
      }
    } catch {
      setError('Update failed');
    } finally {
      setBusy(false);
    }
  }

  const status = detail?.status ?? '';
  const step = NEXT_STEP[status];
  const canCancel = CANCELLABLE.includes(status);
  const currency = detail?.payment_currency ?? 'USD';
  const isPdf = detail?.receipt_path?.toLowerCase().endsWith('.pdf');
  const subtotal = detail ? detail.items.reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0) : 0;
  const addr = (detail?.shipping_address ?? {}) as Record<string, unknown>;
  const addressLines = [addr.line1, addr.line2, [addr.city, addr.postal_code].filter(Boolean).join(' '), addr.country]
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <aside className="relative w-full max-w-xl h-full bg-ivory overflow-y-auto border-l border-(--hairline)">
        <div className="sticky top-0 z-10 bg-ivory border-b border-(--hairline) px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-lg text-espresso truncate">{detail?.order_number ?? 'Order'}</p>
            {detail && <p className="text-xs text-umber">Placed {fmtDate(detail.created_at)}</p>}
          </div>
          <div className="flex items-center gap-3">
            {detail && <StatusBadge status={detail.status} />}
            <button onClick={onClose} className="text-espresso text-xl leading-none px-1" aria-label="Close">
              ×
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="border border-red-300 bg-red-50 text-red-800 text-sm px-3 py-2">{error}</p>}
          {!detail && !error && <p className="font-mono-label text-xs uppercase tracking-widest text-umber">Loading…</p>}

          {detail && (
            <>
              {/* Actions */}
              {(step || canCancel) && (
                <div className="flex flex-wrap gap-3">
                  {step && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        changeStatus(
                          step.status,
                          step.status === 'confirmed'
                            ? 'Mark this payment as verified? Make sure the money is in Payoneer.'
                            : `${step.label}?`,
                        )
                      }
                      className="bg-espresso text-ivory hover:bg-saddle disabled:opacity-50 px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest transition-colors"
                    >
                      {busy ? 'Saving…' : step.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      disabled={busy}
                      onClick={() => changeStatus('cancelled', 'Cancel this order? This cannot be undone.')}
                      className="border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest transition-colors"
                    >
                      Cancel order
                    </button>
                  )}
                </div>
              )}

              {/* Payment */}
              <Section title="Payment">
                {status === 'payment_review' && (
                  <p className="mb-3 border border-orange-300 bg-orange-50 text-orange-900 text-sm px-3 py-2">
                    Check Payoneer for <strong>{money(detail.payment_amount, currency, true)}</strong>
                    {detail.sender_name ? (
                      <>
                        {' '}
                        from <strong>{detail.sender_name}</strong>
                      </>
                    ) : null}
                    , then verify.
                  </p>
                )}
                <Row label="Payment status">
                  <span
                    className={`inline-block px-2 py-1 font-mono-label text-[0.65rem] uppercase tracking-wider ${
                      paymentState(detail.status).style
                    }`}
                  >
                    {paymentState(detail.status).label}
                  </span>
                </Row>
                <Row label="Customer pays">{money(detail.payment_amount, currency, true)}</Row>
                <Row label="Order total (USD)">{money(detail.total_amount)}</Row>
                <Row label="Rate used">
                  {detail.exchange_rate ? `1 USD = ${Number(detail.exchange_rate)} ${currency}` : '—'}
                </Row>
                <Row label="Sender name">{detail.sender_name ?? '—'}</Row>
                <Row label="Transfer date">{detail.transfer_date ?? '—'}</Row>
                <Row label="Receipt sent">{fmtDate(detail.payment_submitted_at)}</Row>

                <div className="mt-3 pt-3 border-t border-(--hairline)">
                  {detail.receipt_url ? (
                    isPdf ? (
                      <a
                        href={detail.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-saddle underline text-sm"
                      >
                        Open receipt (PDF) ↗
                      </a>
                    ) : (
                      <a href={detail.receipt_url} target="_blank" rel="noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={detail.receipt_url}
                          alt="Payment receipt"
                          className="max-h-80 w-auto border border-(--hairline)"
                        />
                        <span className="block mt-2 text-saddle underline text-sm">Open full size ↗</span>
                      </a>
                    )
                  ) : detail.receipt_path ? (
                    <p className="text-sm text-umber">Could not load the receipt. Refresh and try again.</p>
                  ) : (
                    <p className="text-sm text-umber">No receipt uploaded yet.</p>
                  )}
                </div>
              </Section>

              {/* Items */}
              <Section title={`Items (${detail.items.length})`}>
                <div className="divide-y divide-(--hairline)">
                  {detail.items.map(item => (
                    <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="w-16 h-16 object-cover border border-(--hairline)" />
                      ) : (
                        <div className="w-16 h-16 bg-white/60 border border-(--hairline)" />
                      )}
                      <div className="flex-1 min-w-0">
                        {item.slug ? (
                          <a
                            href={`/p/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-espresso hover:text-saddle"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <p className="text-sm text-espresso">{item.name}</p>
                        )}
                        {item.variants.length > 0 && (
                          <p className="text-xs text-umber mt-0.5">{item.variants.join(' · ')}</p>
                        )}
                        <p className="text-xs text-umber mt-1">
                          {item.quantity} × {money(item.unit_price)}
                        </p>
                      </div>
                      <p className="text-sm text-espresso whitespace-nowrap">
                        {money(Number(item.unit_price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-(--hairline)">
                  <Row label="Subtotal">{money(subtotal)}</Row>
                  <Row label="Shipping">{money(detail.shipping_amount)}</Row>
                  <div className="flex justify-between gap-4 py-1.5 text-sm font-medium">
                    <span className="text-espresso">Total</span>
                    <span className="text-espresso">{money(detail.total_amount)}</span>
                  </div>
                </div>
              </Section>

              {/* Customer */}
              <Section title="Customer">
                <Row label="Name">{detail.full_name}</Row>
                <Row label="Email">
                  <a href={`mailto:${detail.email}`} className="text-saddle underline">
                    {detail.email}
                  </a>
                </Row>
                <Row label="Phone">
                  {detail.phone ? (
                    <a href={`tel:${detail.phone}`} className="text-saddle underline">
                      {detail.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </Row>
              </Section>

              {/* Address */}
              <Section title="Shipping address">
                {addressLines.length === 0 ? (
                  <p className="text-sm text-umber">No address.</p>
                ) : (
                  <div className="text-sm text-espresso space-y-0.5">
                    {addressLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}
              </Section>

              {detail.notes && (
                <Section title="Customer notes">
                  <p className="text-sm text-espresso whitespace-pre-wrap">{detail.notes}</p>
                </Section>
              )}

              {/* Timeline */}
              <Section title="Timeline">
                {detail.history.length === 0 ? (
                  <p className="text-sm text-umber">No history yet.</p>
                ) : (
                  detail.history.map(h => (
                    <Row key={h.status} label={STATUS_LABELS[h.status] ?? h.status}>
                      {fmtDate(h.happened_at)}
                    </Row>
                  ))
                )}
              </Section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const json = await authFetch('/api/admin/orders');
      if (json.success) {
        setOrders(json.data);
        setError('');
      } else {
        setError(json.error ?? 'Failed to load orders');
      }
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function refresh() {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }

  const matchesTab = useCallback((o: OrderRow, key: string) => {
    if (key === 'all') return true;
    if (key === 'awaiting_payment') return o.status === 'awaiting_payment' || o.status === 'pending';
    return o.status === key;
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const t of FILTER_TABS) result[t.key] = orders.filter(o => matchesTab(o, t.key)).length;
    return result;
  }, [orders, matchesTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      o =>
        matchesTab(o, tab) &&
        (!q ||
          (o.order_number ?? '').toLowerCase().includes(q) ||
          o.full_name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)),
    );
  }, [orders, tab, query, matchesTab]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-espresso mb-1">Orders</h2>
          <p className="text-sm text-umber">Verify payments and move orders forward.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search order no., name, email"
            className="border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso w-64 max-w-full outline-none focus:border-saddle"
          />
          <button
            onClick={refresh}
            disabled={refreshing}
            className="border border-(--hairline) px-4 py-2 font-mono-label text-xs uppercase tracking-widest text-espresso hover:border-saddle disabled:opacity-50 transition-colors"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-2 font-mono-label text-xs uppercase tracking-wider border transition-colors ${
              tab === t.key ? 'bg-espresso text-ivory border-espresso' : 'border-(--hairline) text-umber hover:border-saddle'
            }`}
          >
            {t.label} <span className="opacity-70">({counts[t.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {error && <p className="border border-red-300 bg-red-50 text-red-800 text-sm px-3 py-2 mb-4">{error}</p>}

      <div className="border border-(--hairline) bg-ivory overflow-x-auto">
        <table className="w-full text-sm min-w-205">
          <thead>
            <tr className="border-b border-(--hairline) text-left font-mono-label text-[0.65rem] uppercase tracking-widest text-umber">
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Items</th>
              <th className="px-4 py-3 font-normal">Total</th>
              <th className="px-4 py-3 font-normal">Payment</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-umber">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-umber">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map(o => {
                const pay = paymentState(o.status);
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={`border-b border-(--hairline) last:border-0 cursor-pointer hover:bg-white/60 ${
                      o.status === 'payment_review' ? 'bg-orange-50/60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono-label text-xs text-espresso whitespace-nowrap">
                      {o.order_number ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-umber whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="text-espresso">{o.full_name}</p>
                      <p className="text-xs text-umber">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 text-espresso">{o.item_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-espresso">{money(o.total_amount)}</p>
                      {o.payment_currency && o.payment_currency !== 'USD' && (
                        <p className="text-xs text-umber">{money(o.payment_amount, o.payment_currency, true)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 font-mono-label text-[0.65rem] uppercase tracking-wider whitespace-nowrap ${pay.style}`}
                      >
                        {pay.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <OrderPanel key={selectedId} id={selectedId} onClose={() => setSelectedId(null)} onChanged={loadOrders} />
      )}
    </div>
  );
}
