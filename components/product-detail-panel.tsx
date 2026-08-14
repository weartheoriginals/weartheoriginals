'use client';

import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

export type CustomizationOption = {
  label: string;
  choices: string[];
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetailPanel({
  slug,
  name,
  price,
  description,
  imageUrl,
  customizations,
}: {
  slug: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  customizations: CustomizationOption[];
}) {
  const { addItem } = useCart();
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(customizations.map(option => [option.label, option.choices[0]])),
  );
  const [added, setAdded] = useState(false);

  function handleSelect(label: string, choice: string) {
    setSelections(prev => ({ ...prev, [label]: choice }));
  }

  function handleAddToBag() {
    addItem({ slug, name, price, imageUrl, customizations: selections });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="md:sticky md:top-28">
      <h1 className="font-display font-light text-3xl md:text-4xl text-espresso">{name}</h1>
      <p className="mt-3 font-mono-label text-sm text-umber">{formatPrice(price)}</p>

      <p className="mt-6 text-umber leading-relaxed max-w-md">{description}</p>

      {customizations.length > 0 && (
        <div className="mt-8 border-t border-espresso/10 pt-8">
          <p className="font-mono-label text-[11px] uppercase text-brass mb-5">Customise This Item</p>
          <div className="space-y-5">
            {customizations.map(option => (
              <div key={option.label} className="flex items-center justify-between border-b border-espresso/10 pb-3">
                <label htmlFor={`option-${option.label}`} className="font-mono-label text-[11px] uppercase text-umber">
                  {option.label}
                </label>
                <select
                  id={`option-${option.label}`}
                  value={selections[option.label]}
                  onChange={event => handleSelect(option.label, event.target.value)}
                  className="font-mono-label text-[11px] uppercase text-espresso bg-transparent border-none text-right focus:outline-none focus-visible:underline cursor-pointer"
                >
                  {option.choices.map(choice => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToBag}
        className="mt-8 w-full bg-espresso text-ivory font-mono-label text-[12px] uppercase py-4 hover:bg-umber transition-colors"
      >
        {added ? 'Added to Bag' : 'Add to Bag'}
      </button>
    </div>
  );
}
