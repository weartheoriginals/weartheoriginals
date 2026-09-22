'use client';

import { submitCustomRequest, type CustomRequestFields } from '@/lib/submit-custom-request';
import { useEffect, useMemo, useRef, useState } from 'react';

const PRODUCT_OPTIONS = [
  { value: 'mens-jackets', label: "Men's Jackets" },
  { value: 'womens-jackets', label: "Women's Jackets" },
  { value: 'bags-and-clutches', label: 'Bags & Clutches' },
  { value: 'vintage-leather', label: 'Vintage Leather' },
  { value: 'leather-accessories', label: 'Leather Accessories' },
  { value: 'other', label: 'Other' },
];

const STEPS = [
  { title: 'Product', sub: 'What would you like customized?' },
  { title: 'Your Idea', sub: 'Tell us about your design.' },
  { title: 'Upload Reference', sub: 'Share your files (optional).' },
  { title: 'Review & Submit', sub: "We'll get back to you soon." },
];

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_DESC = 1000;

const inputCls =
  'w-full border border-espresso/20 bg-ivory px-4 py-3.5 text-base text-espresso placeholder:text-umber/50 focus:outline-none focus:border-espresso transition-colors';
const labelCls = 'block font-mono-label text-xs uppercase tracking-widest text-umber mb-2';

export default function CustomRequestForm({ initialProductSlug }: { initialProductSlug?: string }) {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);

  const [productType, setProductType] = useState('leather_jacket');
  const [productOther, setProductOther] = useState('');
  const [productId, setProductId] = useState<string | undefined>();

  const [details, setDetails] = useState({
    color: '',
    material: '',
    patches: '',
    embroidery: '',
    hardware: '',
    measurements: '',
  });
  const [description, setDescription] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [contact, setContact] = useState({ full_name: '', email: '', phone: '' });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedNumber, setSubmittedNumber] = useState('');

  // Preselect product when arriving from a product page CTA (?product=<slug>)
  useEffect(() => {
    if (!initialProductSlug) return;
    fetch(`/api/custom-requests/product-lookup?slug=${encodeURIComponent(initialProductSlug)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (!json?.success) return;
        setProductId(json.data.id);
        if (json.data.product_type) setProductType(json.data.product_type);
      })
      .catch(() => {});
  }, [initialProductSlug]);

  function goTo(next: number) {
    setStep(next);
    setMaxStep(m => Math.max(m, next));
    setError('');
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    let problem = '';
    const next = [...files];
    for (const f of incoming) {
      if (!ALLOWED.includes(f.type)) {
        problem = 'Only JPG, PNG or PDF files are allowed';
        continue;
      }
      if (f.size > MAX_BYTES) {
        problem = `"${f.name}" is over 5 MB`;
        continue;
      }
      if (next.length >= MAX_FILES) {
        problem = `You can upload up to ${MAX_FILES} files`;
        break;
      }
      next.push(f);
    }
    setFiles(next);
    setFileError(problem);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileError('');
  }

  const canContinueStep0 = productType !== 'other' || productOther.trim().length > 0;

  const fields: CustomRequestFields = useMemo(
    () => ({
      ...contact,
      product_type: productType,
      product_type_other: productType === 'other' ? productOther : undefined,
      product_id: productId,
      ...details,
      other_requests: description,
    }),
    [contact, productType, productOther, productId, details, description],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.full_name.trim() || !contact.email.trim() || !contact.phone.trim()) {
      setError('Please fill in your name, email and phone number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { requestNumber } = await submitCustomRequest(fields, files);
      setSubmittedNumber(requestNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Request Received screen ----
  if (submittedNumber) {
    return (
      <div className="border border-espresso/10 bg-ivory px-8 py-16 text-center max-w-2xl mx-auto">
        <p className="font-mono-label text-[11px] uppercase tracking-widest text-brass">Request Received</p>
        <h3 className="mt-4 font-display font-light text-3xl md:text-4xl text-espresso">Thank you, we&apos;ve got it.</h3>
        <p className="mt-5 text-umber leading-relaxed">
          Our team will review your design and contact you with pricing and production details.
        </p>
        <p className="mt-8 font-mono-label text-xs uppercase tracking-widest text-umber">Your reference number</p>
        <p className="mt-2 font-display text-3xl text-espresso">{submittedNumber}</p>
        <p className="mt-6 text-sm text-umber">Keep this number handy if you contact us about your request.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr_420px]">
      {/* Step list */}
      <ol className="hidden lg:block space-y-8 border-r border-espresso/10 pr-8">
        {STEPS.map((s, i) => {
          const reachable = i <= maxStep;
          const active = i === step;
          return (
            <li key={s.title}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => goTo(i)}
                className="flex items-start gap-4 text-left disabled:cursor-default"
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono-label text-xs ${
                    active ? 'bg-espresso text-ivory border-espresso' : 'border-espresso/30 text-umber'
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className={`block text-base ${active ? 'text-espresso' : 'text-umber'}`}>{s.title}</span>
                  <span className="mt-1 block text-sm text-umber/70">{s.sub}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Step content */}
      <form onSubmit={handleSubmit} className="min-w-0">
        <p className="lg:hidden font-mono-label text-xs uppercase tracking-widest text-brass mb-4">
          Step {step + 1} of {STEPS.length} · {STEPS[step].title}
        </p>

        {/* Step 1: Product */}
        {step === 0 && (
          <div>
            <h3 className="font-display text-2xl text-espresso mb-5">1. What would you like customized?</h3>
            <div className="space-y-3">
              {PRODUCT_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 border px-4 py-3.5 cursor-pointer transition-colors ${
                    productType === opt.value ? 'border-espresso bg-ivory' : 'border-espresso/20 hover:border-espresso/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="product_type"
                    value={opt.value}
                    checked={productType === opt.value}
                    onChange={() => setProductType(opt.value)}
                    className="accent-espresso"
                  />
                  <span className="text-base text-espresso">{opt.label}</span>
                </label>
              ))}
            </div>

            {productType === 'other' && (
              <div className="mt-4">
                <label htmlFor="product-other" className={labelCls}>
                  Describe the product
                </label>
                <input
                  id="product-other"
                  value={productOther}
                  onChange={e => setProductOther(e.target.value)}
                  maxLength={120}
                  className={inputCls}
                  placeholder="e.g. Leather belt"
                />
              </div>
            )}

            <button
              type="button"
              disabled={!canContinueStep0}
              onClick={() => goTo(1)}
              className="mt-6 inline-flex items-center gap-3 bg-espresso text-ivory font-mono-label text-xs uppercase tracking-widest px-6 py-4 hover:bg-umber transition-colors disabled:opacity-50"
            >
              Next Step <span aria-hidden>→</span>
            </button>
          </div>
        )}

        {/* Step 2: Idea */}
        {step === 1 && (
          <div>
            <h3 className="font-display text-2xl text-espresso mb-1">2. Tell us more about your idea</h3>
            <p className="text-sm text-umber mb-5">
              Add any details, preferences or special requests. Everything here is optional.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {(
                [
                  ['color', 'Color', 'e.g. Black with tan lining'],
                  ['material', 'Material', 'e.g. Full-grain lambskin'],
                  ['hardware', 'Hardware', 'e.g. Silver zippers'],
                  ['patches', 'Patches', 'e.g. Mountain patch on the sleeve'],
                  ['embroidery', 'Embroidery', 'e.g. Red text on the back'],
                  ['measurements', 'Measurements', 'e.g. Chest 42in, sleeve 25in'],
                ] as const
              ).map(([key, label, placeholder]) => (
                <div key={key}>
                  <label htmlFor={`detail-${key}`} className={labelCls}>
                    {label}
                  </label>
                  <input
                    id={`detail-${key}`}
                    value={details[key]}
                    onChange={e => setDetails(d => ({ ...d, [key]: e.target.value }))}
                    maxLength={500}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label htmlFor="description" className={labelCls}>
                Anything else?
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, MAX_DESC))}
                rows={5}
                placeholder="e.g. I want a black leather bomber with silver hardware, red embroidery on the back and my initials on the sleeve."
                className={`${inputCls} resize-none`}
              />
              <p className="mt-1 text-right text-xs text-umber/70">
                {description.length}/{MAX_DESC}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => goTo(0)}
                className="border border-espresso/30 text-espresso font-mono-label text-xs uppercase tracking-widest px-6 py-4 hover:border-espresso transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goTo(2)}
                className="inline-flex items-center gap-3 bg-espresso text-ivory font-mono-label text-xs uppercase tracking-widest px-6 py-4 hover:bg-umber transition-colors"
              >
                Next Step <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload */}
        {step === 2 && (
          <div>
            <h3 className="font-display text-2xl text-espresso mb-1">3. Have your own design?</h3>
            <p className="text-sm text-umber mb-5">
              Upload reference files, sketches or images of what you have in mind. Optional.
            </p>

            <div
              onDragOver={e => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center border border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? 'border-espresso bg-espresso/5' : 'border-espresso/30'
              }`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                className="text-umber"
              >
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
              </svg>
              <p className="mt-3 text-base text-espresso">Drag &amp; drop your files here</p>
              <p className="my-2 text-xs text-umber">or</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-espresso text-ivory font-mono-label text-[11px] uppercase tracking-widest px-5 py-3 hover:bg-umber transition-colors"
              >
                Browse Files
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={e => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <p className="mt-4 text-xs text-umber">JPG, PNG, PDF (Max 5 MB per file) · Up to {MAX_FILES} files</p>
            </div>

            {fileError && <p className="mt-3 text-sm text-red-500">{fileError}</p>}

            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between border border-espresso/20 px-4 py-3"
                  >
                    <span className="truncate pr-4 text-sm text-espresso">
                      {f.name} <span className="text-umber/70">· {(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="font-mono-label text-xs uppercase tracking-widest text-umber hover:text-espresso"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 bg-espresso/5 p-4 text-sm text-umber leading-relaxed">
              <p className="text-espresso">Please note:</p>
              Uploaded files are references for our design team. Every custom request is reviewed before production. We may
              contact you if additional information or a higher-quality file is required.
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => goTo(1)}
                className="border border-espresso/30 text-espresso font-mono-label text-xs uppercase tracking-widest px-6 py-4 hover:border-espresso transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goTo(3)}
                className="inline-flex items-center gap-3 bg-espresso text-ivory font-mono-label text-xs uppercase tracking-widest px-6 py-4 hover:bg-umber transition-colors"
              >
                Next Step <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & submit */}
        {step === 3 && (
          <div>
            <h3 className="font-display text-2xl text-espresso mb-5">4. Review &amp; submit</h3>

            <div className="border border-espresso/10 bg-ivory p-5 text-sm text-umber space-y-1.5">
              <p>
                <span className="text-espresso">Product:</span>{' '}
                {productType === 'other' ? productOther : PRODUCT_OPTIONS.find(o => o.value === productType)?.label}
              </p>
              {Object.entries(details)
                .filter(([, v]) => v.trim())
                .map(([k, v]) => (
                  <p key={k}>
                    <span className="capitalize text-espresso">{k}:</span> {v}
                  </p>
                ))}
              {description.trim() && (
                <p>
                  <span className="text-espresso">Notes:</span> {description}
                </p>
              )}
              <p>
                <span className="text-espresso">Files:</span>{' '}
                {files.length === 0 ? 'None' : files.map(f => f.name).join(', ')}
              </p>
            </div>

            <p className="mt-6 mb-4 text-sm text-umber">How should we reach you with your quote?</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="c-name" className={labelCls}>
                  Full name
                </label>
                <input
                  id="c-name"
                  required
                  value={contact.full_name}
                  onChange={e => setContact(c => ({ ...c, full_name: e.target.value }))}
                  maxLength={120}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="c-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  required
                  value={contact.email}
                  onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="c-phone" className={labelCls}>
                  Phone / WhatsApp
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  required
                  value={contact.phone}
                  onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <p className="mt-5 text-xs text-umber/80">
              Reference files only. All designs are subject to review and approval. Submitting is free, and nothing is
              charged until you approve a quote.
            </p>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => goTo(2)}
                disabled={submitting}
                className="border border-espresso/30 text-espresso font-mono-label text-xs uppercase tracking-widest px-6 py-4 hover:border-espresso transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-espresso text-ivory font-mono-label text-xs uppercase tracking-widest px-8 py-4 hover:bg-umber transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Right preview panel */}
      <div className="hidden lg:block">
        <div className="sticky top-28 aspect-4/5 bg-espresso/5 overflow-hidden">
          <img src="/custom/preview.jpg" alt="Custom OGNLS jacket preview" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
