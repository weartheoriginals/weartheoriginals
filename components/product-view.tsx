'use client';

import { getFakeRating, isColorAttribute, type GalleryImage, type ProductSummary } from '@/lib/product-ui';
import type { ProductVariant } from '@/lib/types';
import { groupVariants } from '@/lib/variant-helpers';
import { useMemo, useState } from 'react';
import MobileGallery from './mobile-gallery';
import ProductGallery from './product-gallery';
import ProductInfo from './product-info';

export default function ProductView({
  product,
  variants,
  images,
}: {
  product: ProductSummary;
  variants: ProductVariant[];
  images: GalleryImage[]; // already sorted, never empty
}) {
  const grouped = useMemo(() => groupVariants(variants), [variants]);
  const colorKey = Object.keys(grouped).find(isColorAttribute);

  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.keys(grouped).map(k => [k, grouped[k][0].attribute_value])),
  );

  const activeColor = colorKey ? grouped[colorKey].find(v => v.attribute_value === selections[colorKey]) : undefined;

  // Gallery = images of the selected color. Falls back to shared images, then to everything.
  const own = activeColor ? images.filter(i => i.variantId === activeColor.id) : [];
  const shared = images.filter(i => !i.variantId);
  const shown = own.length ? own : shared.length ? shared : images;

  function select(attr: string, value: string) {
    setSelections(prev => ({ ...prev, [attr]: value }));
  }

  // Mobile swipe list: every image, grouped by color in color order, shared images last.
  const mobileImages = useMemo(() => {
    if (!colorKey) return images;
    const ordered = grouped[colorKey].flatMap(v => images.filter(i => i.variantId === v.id));
    const shared = images.filter(i => !i.variantId);
    const all = [...ordered, ...shared];
    return all.length ? all : images;
  }, [grouped, colorKey, images]);

  function selectColorById(variantId: string) {
    if (!colorKey) return;
    const v = grouped[colorKey].find(x => x.id === variantId);
    if (v) select(colorKey, v.attribute_value);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14">
        <div className="hidden md:block">
          <ProductGallery key={activeColor?.id ?? 'all'} images={shown.map(i => i.url)} productName={product.name} />
        </div>
        <MobileGallery
          images={mobileImages}
          productName={product.name}
          activeVariantId={activeColor?.id}
          onVariantChange={selectColorById}
        />
        <ProductInfo
          product={product}
          imageUrl={shown[0].url}
          variants={variants}
          grouped={grouped}
          selections={selections}
          onSelect={select}
          rating={getFakeRating(product.slug)}
        />
      </div>
    </>
  );
}
