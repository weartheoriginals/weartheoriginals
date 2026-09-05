'use client';

import { useCart } from '@/lib/cart-context';
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
          <p className="font-mono-label text-[11px] uppercase text-brass mb-5">Customise This Item</p>
          <div className="space-y-5">
            {attributeNames.map(attributeName => (
              <div key={attributeName} className="flex items-center justify-between border-b border-espresso/10 pb-3">
                <label htmlFor={`option-${attributeName}`} className="font-mono-label text-[11px] uppercase text-umber">
                  {attributeName}
                </label>
                <select
                  id={`option-${attributeName}`}
                  value={selections[attributeName]}
                  onChange={event => handleSelect(attributeName, event.target.value)}
                  className="font-mono-label text-[11px] uppercase text-espresso bg-transparent border-none text-right focus:outline-none focus-visible:underline cursor-pointer"
                >
                  {grouped[attributeName].map(variant => (
                    <option key={variant.id} value={variant.attribute_value}>
                      {variant.attribute_value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {stock !== null && stock > 0 && stock <= 5 && <p className="mt-3 text-xs text-saddle">Only {stock} left</p>}
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
