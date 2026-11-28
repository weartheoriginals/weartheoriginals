'use client';

import { CUSTOM_STATUSES, statusLabel, typeLabel } from '@/lib/custom-request-types';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface RequestRow {
  id: string;
  request_number: string | null;
  full_name: string;
  email: string;
  phone: string;
  product_type: string;
  product_type_other: string | null;
  product_name: string | null;
  status: string;
  quote_total: number | null;
  created_at: string;
}

interface RequestDetail extends RequestRow {
  color: string | null;
  material: string | null;
  patches: string | null;
  embroidery: string | null;
  hardware: string | null;
  measurements: string | null;
  other_requests: string | null;
  quote_customization: number | null;
  quote_shipping: number | null;
  quote_timeline: string | null;
  quote_notes: string | null;
  admin_notes: string | null;
  product_slug: string | null;
  files: { id: string; name: string; mime_type: string; size_bytes: number; url: string | null }[];
  history: { status: string; happened_at: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  awaiting_files: 'bg-stone-100 text-stone-600',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-orange-100 text-orange-800',
  quoted: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  in_production: 'bg-amber-100 text-amber-800',
  quality_check: 'bg-amber-100 text-amber-800',
  shipped: 'bg-sky-100 text-sky-800',
  completed: 'bg-green-200 text-green-900',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TABS = [
  { key: 'all', label: 'All' },
  ...CUSTOM_STATUSES.filter(s => s.value !== 'awaiting_files').map(s => ({ key: s.value, label: s.label })),
  { key: 'awaiting_files', label: 'Incomplete' },
];

async function authFetch(url: string, init?: { method?: string; body?: string }) {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
  });
  return res.json();
}

const money = (n: number | string | null | undefined) =>
  n === null || n === undefined || n === ''
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-1 font-mono-label text-[0.65rem] uppercase tracking-wider whitespace-nowrap ${
        STATUS_STYLES[status] ?? 'bg-stone-100 text-stone-700'
      }`}
    >
      {statusLabel(status)}
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

const fieldCls =
  'w-full border border-(--hairline) bg-ivory px-3 py-2 text-sm text-espresso outline-none focus:border-saddle';
const labelCls = 'block font-mono-label text-[0.65rem] uppercase tracking-wider text-umber mb-1.5';

function RequestPanel({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState('');
  const [customization, setCustomization] = useState('');
  const [shipping, setShipping] = useState('');
  const [timeline, setTimeline] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const load = useCallback(async () => {
    try {
      const json = await authFetch(`/api/admin/custom-requests/${id}`);
      if (!json.success) {
        setError(json.error ?? 'Failed to load request');
        return;
      }
      const d: RequestDetail = json.data;
      setDetail(d);
      setStatus(d.status);
      setCustomization(d.quote_customization?.toString() ?? '');
      setShipping(d.quote_shipping?.toString() ?? '');
      setTimeline(d.quote_timeline ?? '');
      setQuoteNotes(d.quote_notes ?? '');
      setAdminNotes(d.admin_notes ?? '');
    } catch {
      setError('Failed to load request');
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

  async function save() {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const json = await authFetch(`/api/admin/custom-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          quote_customization: customization,
          quote_shipping: shipping,
          quote_timeline: timeline,
          quote_notes: quoteNotes,
          admin_notes: adminNotes,
        }),
      });
      if (!json.success) {
        setError(json.error ?? 'Save failed');
      } else {
        await load();
        onChanged();
        setSaved(true);
      }
    } catch {
      setError('Save failed');
    } finally {
      setBusy(false);
    }
  }

  const total = customization !== '' || shipping !== '' ? (Number(customization) || 0) + (Number(shipping) || 0) : null;

  const details = detail
    ? (
        [
          ['Color', detail.color],
          ['Material', detail.material],
          ['Hardware', detail.hardware],
          ['Patches', detail.patches],
          ['Embroidery', detail.embroidery],
          ['Measurements', detail.measurements],
        ] as const
      ).filter(([, v]) => v)
    : [];

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <aside className="relative w-full max-w-xl h-full bg-ivory overflow-y-auto border-l border-(--hairline)">
        <div className="sticky top-0 z-10 bg-ivory border-b border-(--hairline) px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-lg text-espresso truncate">{detail?.request_number ?? 'Request'}</p>
            {detail && <p className="text-xs text-umber">Received {fmtDate(detail.created_at)}</p>}
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
          {saved && <p className="border border-green-200 bg-green-50 text-green-700 text-sm px-3 py-2">Saved</p>}
          {!detail && !error && <p className="font-mono-label text-xs uppercase tracking-widest text-umber">Loading…</p>}

          {detail && (
            <>
              <Section title="Customer">
                <Row label="Name">{detail.full_name}</Row>
                <Row label="Email">
                  <a href={`mailto:${detail.email}`} className="text-saddle underline">
                    {detail.email}
                  </a>
                </Row>
                <Row label="Phone">
                  <a href={`tel:${detail.phone}`} className="text-saddle underline">
                    {detail.phone}
                  </a>
                  {' · '}
                  <a
                    href={`https://wa.me/${detail.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-saddle underline"
                  >
                    WhatsApp ↗
                  </a>
                </Row>
              </Section>

              <Section title="Request">
                <Row label="Type">{typeLabel(detail.product_type, detail.product_type_other)}</Row>
                {detail.product_name && (
                  <Row label="From product">
                    {detail.product_slug ? (
                      <a
                        href={`/p/${detail.product_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-saddle underline"
                      >
                        {detail.product_name}
                      </a>
                    ) : (
                      detail.product_name
                    )}
                  </Row>
                )}
                {details.map(([k, v]) => (
                  <Row key={k} label={k}>
                    {v}
                  </Row>
                ))}
                {detail.other_requests && (
                  <div className="mt-2 pt-2 border-t border-(--hairline)">
                    <p className="text-xs text-umber mb-1">Notes</p>
                    <p className="text-sm text-espresso whitespace-pre-wrap">{detail.other_requests}</p>
                  </div>
                )}
              </Section>

              <Section title={`Files (${detail.files.length})`}>
                {detail.files.length === 0 ? (
                  <p className="text-sm text-umber">No files.</p>
                ) : (
                  <div className="space-y-3">
                    {detail.files.map(f => (
                      <div key={f.id}>
                        {f.url && f.mime_type.startsWith('image/') && (
                          <a href={f.url} target="_blank" rel="noreferrer" className="block mb-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.url} alt={f.name} className="max-h-60 w-auto border border-(--hairline)" />
                          </a>
                        )}
                        {f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-saddle underline text-sm wrap-break-word"
                          >
                            {f.name} ↗
                          </a>
                        ) : (
                          <p className="text-sm text-umber">{f.name} (could not load)</p>
                        )}
                        <span className="text-xs text-umber"> · {(f.size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Status & quote">
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className={fieldCls}>
                      {detail.status === 'awaiting_files' && (
                        <option value="awaiting_files" disabled>
                          Incomplete
                        </option>
                      )}
                      {CUSTOM_STATUSES.filter(s => s.value !== 'awaiting_files').map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Customization (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={customization}
                        onChange={e => setCustomization(e.target.value)}
                        className={fieldCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Shipping (USD)</label>
                      <input
                        type="number"
                        min="0"
                        value={shipping}
                        onChange={e => setShipping(e.target.value)}
                        className={fieldCls}
                      />
                    </div>
                  </div>
                  <Row label="Quote total">{money(total)}</Row>

                  <div>
                    <label className={labelCls}>Timeline</label>
                    <input
                      value={timeline}
                      onChange={e => setTimeline(e.target.value)}
                      placeholder="e.g. 3 to 4 weeks"
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Quote notes (for the customer)</label>
                    <textarea
                      value={quoteNotes}
                      onChange={e => setQuoteNotes(e.target.value)}
                      rows={3}
                      className={`${fieldCls} resize-y`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Admin notes (private)</label>
                    <textarea
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      rows={3}
                      className={`${fieldCls} resize-y`}
                    />
                  </div>

                  <button
                    onClick={save}
                    disabled={busy}
                    className="bg-espresso text-ivory hover:bg-saddle disabled:opacity-50 px-5 py-2.5 font-mono-label text-xs uppercase tracking-widest transition-colors"
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </Section>

              <Section title="Timeline">
                {detail.history.length === 0 ? (
                  <p className="text-sm text-umber">No history yet.</p>
                ) : (
                  detail.history.map((h, i) => (
                    <Row key={`${h.status}-${i}`} label={statusLabel(h.status)}>
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

export default function AdminCustomRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const json = await authFetch('/api/admin/custom-requests');
      if (json.success) {
        setRows(json.data);
        setError('');
      } else {
        setError(json.error ?? 'Failed to load requests');
      }
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const matchesTab = useCallback((r: RequestRow, key: string) => {
    if (key === 'all') return r.status !== 'awaiting_files';
    return r.status === key;
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const t of TABS) result[t.key] = rows.filter(r => matchesTab(r, t.key)).length;
    return result;
  }, [rows, matchesTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      r =>
        matchesTab(r, tab) &&
        (!q ||
          (r.request_number ?? '').toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)),
    );
  }, [rows, tab, query, matchesTab]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-espresso mb-1">Custom Requests</h2>
          <p className="text-sm text-umber">Review requests, send quotes and track progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search number, name, email"
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

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {TABS.map(t => (
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
              <th className="px-4 py-3 font-normal">Request</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Type</th>
              <th className="px-4 py-3 font-normal">Quote</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-umber">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-umber">
                  No requests found.
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`border-b border-(--hairline) last:border-0 cursor-pointer hover:bg-white/60 ${
                    r.status === 'submitted' ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono-label text-xs text-espresso whitespace-nowrap">
                    {r.request_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-umber whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="text-espresso">{r.full_name}</p>
                    <p className="text-xs text-umber">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-espresso">{typeLabel(r.product_type, r.product_type_other)}</p>
                    {r.product_name && <p className="text-xs text-umber truncate max-w-56">{r.product_name}</p>}
                  </td>
                  <td className="px-4 py-3 text-espresso whitespace-nowrap">{money(r.quote_total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedId && <RequestPanel key={selectedId} id={selectedId} onClose={() => setSelectedId(null)} onChanged={load} />}
    </div>
  );
}
