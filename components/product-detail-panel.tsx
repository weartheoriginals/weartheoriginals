'use client';

import { useCart } from '@/lib/cart-context';
import { useEffect, useRef } from 'react';
import type { ProductVariant } from '@/lib/types';
import { getSelectionStock, groupVariants, isSelectionComplete, resolveVariantIds } from '@/lib/variant-helpers';
import { useMemo, useState } from 'react';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

function Dropdown({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function toggle() {
    setActiveIndex(Math.max(0, options.indexOf(value)));
    setOpen(o => !o);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) return toggle();
      setActiveIndex(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      onChange(options[activeIndex]);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative" onKeyDown={onKeyDown}>
      <span id={`${id}-label`} className="block font-mono-label text-xs uppercase tracking-widest text-umber mb-2">
        {label}
      </span>

      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}`}
        onClick={toggle}
        className={`w-full flex items-center justify-between border px-4 py-3.5 text-left bg-ivory transition-colors ${
          open ? 'border-espresso' : 'border-espresso/20 hover:border-espresso/50'
        }`}
      >
        <span className="text-base text-espresso">{value}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-umber transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-auto border border-espresso/20 bg-ivory shadow-lg"
        >
          {options.map((opt, i) => {
            const selected = opt === value;
            return (
              <li
                key={opt}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer text-base ${
                  i === activeIndex ? 'bg-espresso/5' : ''
                } ${selected ? 'text-espresso' : 'text-umber'}`}
              >
                {opt}
                {selected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-brass"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ProductDetailPanel({
  productId,
  slug,
  name,
  price,
  description,
  imageUrl,
  variants,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  variants: ProductVariant[];
}) {
  const { addItem } = useCart();
  const grouped = useMemo(() => groupVariants(variants), [variants]);
  const attributeNames = Object.keys(grouped);

  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(attributeNames.map(attributeName => [attributeName, grouped[attributeName][0].attribute_value])),
  );
  const [added, setAdded] = useState(false);
  const [selectionError, setSelectionError] = useState('');

  function handleSelect(attributeName: string, value: string) {
    setSelections(prev => ({ ...prev, [attributeName]: value }));
    setSelectionError('');
  }

  const stock = attributeNames.length > 0 ? getSelectionStock(variants, selections) : null;
  const outOfStock = stock !== null && stock <= 0;

  function handleAddToBag() {
    if (attributeNames.length > 0) {
      if (!isSelectionComplete(grouped, selections)) {
        setSelectionError('Please select an option for every attribute.');
        return;
      }
      const variantIds = resolveVariantIds(variants, selections);
      if (!variantIds) {
        setSelectionError('That combination is not available.');
        return;
      }
      if (outOfStock) {
        setSelectionError('That combination is out of stock.');
        return;
      }
      addItem({ product_id: productId, slug, name, price, imageUrl, customizations: selections, variantIds });
    } else {
      addItem({ product_id: productId, slug, name, price, imageUrl, customizations: {}, variantIds: [] });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="md:sticky md:top-28">
      <h1 className="font-display font-light text-3xl md:text-4xl text-espresso">{name}</h1>
      <p className="mt-3 font-mono-label text-sm text-umber">{formatPrice(price)}</p>

      <p className="mt-6 text-umber leading-relaxed max-w-md">{description}</p>

      {attributeNames.length > 0 && (
        <div className="mt-8 border-t border-espresso/10 pt-8">
          <p className="font-mono-label text-xs uppercase tracking-widest text-brass mb-6">Customise This Item</p>
          <div className="space-y-6">
            {attributeNames.map(attributeName => (
              <Dropdown
                key={attributeName}
                id={`option-${attributeName}`}
                label={attributeName}
                value={selections[attributeName]}
                options={grouped[attributeName].map(v => v.attribute_value)}
                onChange={value => handleSelect(attributeName, value)}
              />
            ))}
          </div>
          {stock !== null && stock > 0 && stock <= 5 && <p className="mt-4 text-sm text-saddle">Only {stock} left</p>}
        </div>
      )}

      {selectionError && <p className="mt-4 text-sm text-red-500">{selectionError}</p>}

      <button
        type="button"
        onClick={handleAddToBag}
        disabled={outOfStock}
        className="mt-8 w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 hover:bg-umber transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {outOfStock ? 'Out of Stock' : added ? 'Added to Bag' : 'Add to Bag'}
      </button>
    </div>
  );
}
