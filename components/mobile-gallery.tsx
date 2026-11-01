'use client';

import type { GalleryImage } from '@/lib/product-ui';
import { useEffect, useRef, useState } from 'react';

export default function MobileGallery({
  images,
  productName,
  activeVariantId,
  onVariantChange,
}: {
  images: GalleryImage[];
  productName: string;
  activeVariantId?: string;
  onVariantChange: (variantId: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  // Swiping: work out which image is showing, and switch the color if it belongs to another one.
  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    const variantId = images[next]?.variantId;
    if (variantId && variantId !== activeVariantId) onVariantChange(variantId);
  }

  // Color picked from the dropdown: jump to that color's first image.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !activeVariantId) return;
    if (images[indexRef.current]?.variantId === activeVariantId) return;

    let target = images.findIndex(i => i.variantId === activeVariantId);
    if (target === -1) {
      // This color has no images of its own, so show the shared ones.
      if (!images[indexRef.current]?.variantId) return;
      target = images.findIndex(i => !i.variantId);
      if (target === -1) return;
    }

    indexRef.current = target;
    setIndex(target);
    el.scrollTo({ left: target * el.clientWidth, behavior: 'auto' });
  }, [activeVariantId, images]);

  return (
    <div className="md:hidden">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          <div key={image.id} className="aspect-4/5 w-full shrink-0 snap-center snap-always overflow-hidden bg-umber/5">
            <img src={image.url} alt={`${productName} — view ${i + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {images.map((image, i) => (
            <span
              key={image.id}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-espresso' : 'bg-espresso/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
