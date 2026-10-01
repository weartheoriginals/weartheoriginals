"use client";

import {
  getFakeRating,
  isColorAttribute,
  type ColorOption,
  type GalleryImage,
  type ProductSummary,
} from "@/lib/product-ui";
import type { ProductVariant } from "@/lib/types";
import { groupVariants } from "@/lib/variant-helpers";
import { useMemo, useState } from "react";
import ColorVariantView from "./color-variant-view";
import ProductGallery from "./product-gallery";
import ProductInfo from "./product-info";

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
    Object.fromEntries(
      Object.keys(grouped).map((k) => [k, grouped[k][0].attribute_value]),
    ),
  );

  const colors: ColorOption[] = useMemo(() => {
    if (!colorKey) return [];
    return grouped[colorKey].map((v) => {
      const first = images.find((i) => i.variantId === v.id);
      const swatch = images.find((i) => i.id === v.image_id) ?? first ?? images[0];
      return {
        id: v.id,
        name: v.attribute_value,
        swatch: swatch.url,
        hero: (first ?? swatch).url,
      };
    });
  }, [grouped, colorKey, images]);

  const activeColor = colorKey
    ? grouped[colorKey].find((v) => v.attribute_value === selections[colorKey])
    : undefined;

  // Gallery = images of the selected color. Falls back to shared images, then to everything.
  const own = activeColor
    ? images.filter((i) => i.variantId === activeColor.id)
    : [];
  const shared = images.filter((i) => !i.variantId);
  const shown = own.length ? own : shared.length ? shared : images;

  function select(attr: string, value: string) {
    setSelections((prev) => ({ ...prev, [attr]: value }));
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14">
        <ProductGallery
          key={activeColor?.id ?? "all"}
          images={shown.map((i) => i.url)}
          productName={product.name}
        />
        <ProductInfo
          product={product}
          imageUrl={shown[0].url}
          variants={variants}
          grouped={grouped}
          selections={selections}
          onSelect={select}
          colors={colors}
          rating={getFakeRating(product.slug)}
        />
      </div>

      {colorKey && colors.length > 1 && (
        <ColorVariantView
          colors={colors}
          selected={selections[colorKey]}
          onSelect={(name) => select(colorKey, name)}
        />
      )}
    </>
  );
}
