'use client';

import { useState } from 'react';

const TABS = [
  ['description', 'Description'],
  ['details', 'Details'],
  ['shipping', 'Shipping & Returns'],
  ['care', 'Care Instructions'],
] as const;

type TabId = (typeof TABS)[number][0];

const CARE = [
  'Clean only with a leather-safe cleaner',
  'Keep away from direct sunlight',
  'Store in a cool, dry place',
  'Condition the leather now and then',
];

const WHY = [
  'Premium quality materials',
  'Timeless, versatile designs',
  'Crafted for lasting durability',
  'Made for modern lifestyles',
];

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-xl text-espresso">{children}</h3>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 list-disc space-y-2 wrap-break-word pl-5 text-sm text-umber marker:text-brass">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Specs({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="space-y-5 wrap-break-word">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-sm text-espresso">{label}</dt>
          <dd className="mt-0.5 text-sm text-umber">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailsText({ text }: { text: string }) {
  const blocks: { type: 'ul' | 'ol' | 'p'; items: string[] }[] = [];

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    let type: 'ul' | 'ol' | 'p' = 'p';
    let content = line;
    if (/^[-*•]\s+/.test(line)) {
      type = 'ul';
      content = line.replace(/^[-*•]\s+/, '');
    } else if (/^\d+[.)]\s+/.test(line)) {
      type = 'ol';
      content = line.replace(/^\d+[.)]\s+/, '');
    }

    const last = blocks[blocks.length - 1];
    if (type !== 'p' && last?.type === type) last.items.push(content);
    else blocks.push({ type, items: [content] });
  }

  return (
    <div className="space-y-4 wrap-break-word text-sm text-umber">
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className="leading-relaxed">
            {b.items[0]}
          </p>
        ) : b.type === 'ul' ? (
          <ul key={i} className="list-disc space-y-2 pl-5 marker:text-brass">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <ol key={i} className="list-decimal space-y-2 pl-5 marker:text-brass">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}

export default function ProductTabs({
  description,
  details,
  features,
  materials,
  brand,
  processingMin,
  processingMax,
  shippingFrom,
  freeDelivery,
  returnPolicy,
}: {
  description: string;
  details: string;
  features: string[] | null;
  materials: string | null;
  brand: string;
  processingMin: number | null;
  processingMax: number | null;
  shippingFrom: string | null;
  freeDelivery: boolean;
  returnPolicy: string | null;
}) {
  const [tab, setTab] = useState<TabId>('description');

  const processing = processingMin && processingMax ? `${processingMin}–${processingMax} business days` : null;

  const specs = (
    [
      ['Material', materials],
      ['Brand', brand],
      ['Processing time', processing],
      ['Ships from', shippingFrom],
    ] as [string, string | null][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div>
      <div role="tablist" className="flex gap-6 md:gap-10 overflow-x-auto border-b border-espresso/10">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls="tab-panel"
            onClick={() => setTab(id)}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-sm transition-colors ${
              tab === id ? 'border-espresso text-espresso' : 'border-transparent text-umber hover:text-espresso'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="tab-panel" aria-labelledby={`tab-${tab}`} className="pt-8 md:pt-10">
        {tab === 'description' && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <Heading>Description</Heading>
              <p className="mt-4 max-w-md wrap-break-word text-sm leading-relaxed text-umber">{description}</p>
              {features && features.length > 0 && <Bullets items={features} />}
            </div>

            <div className="space-y-10 md:col-span-2 lg:col-span-1 lg:border-l lg:border-espresso/10 lg:pl-14">
              <div>
                <Heading>Care Instructions</Heading>
                <Bullets items={CARE} />
              </div>
              <div>
                <Heading>Why Choose OGNLS?</Heading>
                <Bullets items={WHY} />
              </div>
            </div>
          </div>
        )}

        {tab === 'details' && (
          <div className="max-w-md">
            {details.trim() ? (
              <DetailsText text={details} />
            ) : (
              <p className="text-sm text-umber">No extra details for this item yet.</p>
            )}
          </div>
        )}

        {tab === 'shipping' && (
          <div className="grid max-w-3xl grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <Heading>Shipping</Heading>
              <div className="mt-4">
                <Specs
                  rows={[
                    ['Delivery', freeDelivery ? 'Free shipping on this item' : 'Shipping calculated at checkout'],
                    ...(processing ? ([['Processing time', processing]] as [string, string][]) : []),
                    ...(shippingFrom ? ([['Ships from', shippingFrom]] as [string, string][]) : []),
                  ]}
                />
              </div>
            </div>
            <div className="min-w-0">
              <Heading>Returns</Heading>
              <p className="mt-4 wrap-break-word text-sm leading-relaxed text-umber">{returnPolicy}</p>
            </div>
          </div>
        )}

        {tab === 'care' && (
          <div className="max-w-md">
            <Heading>Care Instructions</Heading>
            <Bullets items={CARE} />
          </div>
        )}
      </div>
    </div>
  );
}
