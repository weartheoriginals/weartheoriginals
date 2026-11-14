'use client';

import { useCart } from '@/lib/cart-context';
import { getFinalPrice, type ProductSummary } from '@/lib/product-ui';
import type { GroupedVariants, ProductVariant } from '@/lib/types';
import { isSelectionComplete, resolveVariantIds } from '@/lib/variant-helpers';
import Link from 'next/link';
import { useState } from 'react';
import BestSellerBadge from './best-seller-badge';
import StarRating from './star-rating';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export default function ProductInfo({
  product,
  imageUrl,
  variants,
  grouped,
  selections,
  onSelect,
  rating,
}: {
  product: ProductSummary;
  imageUrl: string;
  variants: ProductVariant[];
  grouped: GroupedVariants;
  selections: Record<string, string>;
  onSelect: (attr: string, value: string) => void;
  rating: { rating: number; count: number };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const attrs = Object.keys(grouped);
  const outOfStock = !product.isInStock;
  const finalPrice = getFinalPrice(product.price, product.discountPercent);
  const hasDiscount = finalPrice < product.price;

  function pick(attr: string, value: string) {
    onSelect(attr, value);
    setError('');
  }

  function handleAdd() {
    const base = {
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price,
      imageUrl,
    };

    if (attrs.length > 0) {
      if (!isSelectionComplete(grouped, selections)) return setError('Please select an option for every attribute.');
      const variantIds = resolveVariantIds(variants, selections);
      if (!variantIds) return setError('That combination is not available.');
      if (outOfStock) return setError('This product is out of stock.');
      addItem({ ...base, customizations: selections, variantIds });
    } else {
      addItem({ ...base, customizations: {}, variantIds: [] });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  const shipsText =
    product.processingMin && product.processingMax
      ? `Ships within ${product.processingMin}-${product.processingMax} business days`
      : null;

  return (
    <div className="md:sticky md:top-28 self-start">
      {product.isBestSeller && <BestSellerBadge className="mb-4" />}
      <p className="font-mono-label text-xs uppercase tracking-widest text-umber">{product.brand}</p>
      <h1 className="mt-2 font-display font-light text-3xl md:text-4xl text-espresso">{product.name}</h1>

      <div className="mt-6 flex items-baseline gap-3">
        <p className="font-display text-2xl text-espresso">{formatPrice(finalPrice)}</p>
        {hasDiscount && (
          <>
            <p className="text-base text-umber line-through">{formatPrice(product.price)}</p>
            <p className="font-mono-label text-xs uppercase tracking-wider text-brass">
              {Math.round(product.discountPercent)}% off
            </p>
          </>
        )}
      </div>

      {!outOfStock && product.fomoQuantity && (
        <p className="mt-3 inline-flex items-center gap-2 border border-brass/40 bg-brass/10 px-3 py-1.5 font-mono-label text-xs uppercase tracking-wider text-brass">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brass" />
          Only {product.fomoQuantity} left in stock
        </p>
      )}
      <div className="mt-3">
        <StarRating rating={rating.rating} count={rating.count} />
      </div>

      {attrs.length > 0 && (
        <div className="mt-6 border-t border-espresso/10 pt-6 space-y-7">
          {attrs.map(attr => (
            <div key={attr}>
              <p className="text-sm text-espresso">{attr}</p>

              <div className="relative mt-3">
                <select
                  value={selections[attr]}
                  onChange={e => pick(attr, e.target.value)}
                  aria-label={attr}
                  className="w-full appearance-none border border-espresso/20 bg-ivory px-4 py-3.5 pr-11 text-base text-espresso transition-colors focus:border-brass focus:outline-none"
                >
                  {grouped[attr].map(v => (
                    <option key={v.id} value={v.attribute_value}>
                      {v.attribute_value}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-espresso"
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M1 1.5l5 5 5-5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="mt-8 w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 hover:bg-umber transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {outOfStock ? 'Out of Stock' : added ? 'Added to Bag' : 'Add to Bag'}
      </button>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-espresso/10 pt-6">
        <div>
          <p className="text-sm text-espresso">{product.freeDelivery ? 'Free Shipping' : 'Shipping'}</p>
          <p className="text-xs text-umber">{product.freeDelivery ? 'On this item' : 'Calculated at checkout'}</p>
        </div>
        <div>
          <p className="text-sm text-espresso">Secure Payment</p>
          <p className="text-xs text-umber">100% protected</p>
        </div>
        <div>
          <p className="text-sm text-espresso">Easy Returns</p>
          <p className="text-xs text-umber">Details below</p>
        </div>
      </div>

      <p className="mt-5 text-xs text-umber">
        {outOfStock ? 'Out of stock' : 'In stock'}
        {shipsText && !outOfStock ? ` · ${shipsText}` : ''}
      </p>

      <div className="mt-6 border-t border-espresso/10 pt-6">
        <p className="text-sm text-umber">Want this customized?</p>
        <Link
          href={`/custom?product=${product.slug}`}
          className="mt-2 inline-block font-mono-label text-xs uppercase tracking-widest text-espresso border-b border-espresso/40 pb-0.5 hover:border-espresso transition-colors"
        >
          Request Customization
        </Link>
      </div>
    </div>
  );
}
