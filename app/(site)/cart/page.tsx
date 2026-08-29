'use client';

import { useCart } from '@/lib/cart-context';
import Link from 'next/link';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-350 px-6 md:px-10 py-24 md:py-32 text-center">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Your Bag</p>
        <h1 className="font-display font-light text-3xl md:text-4xl text-espresso">Your bag is empty.</h1>
        <p className="mt-4 text-umber">Take a look through our latest pieces.</p>
        <Link
          href="/c/jackets"
          className="stitch-underline font-mono-label text-[12px] uppercase text-espresso inline-block mt-8"
        >
          Shop Jackets
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-350 px-6 md:px-10 py-12 md:py-16">
      <p className="font-mono-label text-[11px] uppercase text-brass mb-4">Your Bag</p>
      <h1 className="font-display font-light text-3xl md:text-4xl text-espresso mb-10 md:mb-14">
        {items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
        {items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        <div className="lg:col-span-2 divide-y divide-espresso/10 border-t border-espresso/10">
          {items.map(item => (
            <div key={item.lineId} className="flex gap-5 md:gap-6 py-6">
              <Link href={`/p/${item.slug}`} className="shrink-0 w-24 md:w-32 aspect-3/4 overflow-hidden bg-umber/5">
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/p/${item.slug}`} className="font-display text-lg text-espresso stitch-underline">
                      {item.name}
                    </Link>
                    <p className="font-mono-label text-[13px] text-umber whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  {Object.keys(item.customizations).length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {Object.entries(item.customizations).map(([label, value]) => (
                        <li key={label} className="font-mono-label text-[11px] uppercase text-umber/70">
                          {label}: {value}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="w-7 h-7 flex items-center justify-center border border-espresso/20 text-espresso hover:border-espresso transition-colors"
                    >
                      –
                    </button>
                    <span className="font-mono-label text-[12px] text-espresso w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="w-7 h-7 flex items-center justify-center border border-espresso/20 text-espresso hover:border-espresso transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineId)}
                    className="font-mono-label text-[11px] uppercase text-umber hover:text-espresso stitch-underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border-t border-espresso/10 pt-6">
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[11px] uppercase text-umber">Subtotal</span>
              <span className="font-mono-label text-sm text-espresso">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-umber/70">Shipping and taxes calculated at checkout.</p>

            <Link
              href="/checkout"
              className="mt-6 block w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 text-center hover:bg-umber transition-colors"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
