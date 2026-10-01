"use client";

import { useCart } from "@/lib/cart-context";
import {
  isColorAttribute,
  type ColorOption,
  type ProductSummary,
} from "@/lib/product-ui";
import type { GroupedVariants, ProductVariant } from "@/lib/types";
import {
  getSelectionStock,
  isSelectionComplete,
  resolveVariantIds,
} from "@/lib/variant-helpers";
import Link from "next/link";
import { useState } from "react";
import StarRating from "./star-rating";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductInfo({
  product,
  imageUrl,
  variants,
  grouped,
  selections,
  onSelect,
  colors,
  rating,
}: {
  product: ProductSummary;
  imageUrl: string;
  variants: ProductVariant[];
  grouped: GroupedVariants;
  selections: Record<string, string>;
  onSelect: (attr: string, value: string) => void;
  colors: ColorOption[];
  rating: { rating: number; count: number };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const attrs = Object.keys(grouped);
  const stock = attrs.length > 0 ? getSelectionStock(variants, selections) : null;
  const outOfStock = stock !== null && stock <= 0;

  function pick(attr: string, value: string) {
    onSelect(attr, value);
    setError("");
  }

  function handleAdd() {
    const base = {
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl,
    };

    if (attrs.length > 0) {
      if (!isSelectionComplete(grouped, selections))
        return setError("Please select an option for every attribute.");
      const variantIds = resolveVariantIds(variants, selections);
      if (!variantIds) return setError("That combination is not available.");
      if (outOfStock) return setError("That combination is out of stock.");
      addItem({ ...base, customizations: selections, variantIds });
    } else {
      addItem({ ...base, customizations: {}, variantIds: [] });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  const shipsText =
    product.processingMin && product.processingMax
      ? `Ships within ${product.processingMin}–${product.processingMax} business days`
      : null;

  return (
    <div className="md:sticky md:top-28 self-start">
      <p className="font-mono-label text-xs uppercase tracking-widest text-umber">
        {product.brand}
      </p>
      <h1 className="mt-2 font-display font-light text-3xl md:text-4xl text-espresso">
        {product.name}
      </h1>

      <p className="mt-5 text-umber leading-relaxed max-w-lg">
        {product.description}
      </p>

      <p className="mt-6 font-display text-2xl text-espresso">
        {formatPrice(product.price)}
      </p>
      <div className="mt-2">
        <StarRating rating={rating.rating} count={rating.count} />
      </div>

      {attrs.length > 0 && (
        <div className="mt-6 border-t border-espresso/10 pt-6 space-y-7">
          {attrs.map((attr) => (
            <div key={attr}>
              <p className="text-sm text-espresso">
                {attr}
                <span className="ml-2 text-umber">{selections[attr]}</span>
              </p>

              {isColorAttribute(attr) ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const sel = c.name === selections[attr];
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={sel}
                        aria-label={c.name}
                        onClick={() => pick(attr, c.name)}
                        className="group flex flex-col items-center gap-2"
                      >
                        <span
                          className={`block h-20 w-20 md:h-24 md:w-24 overflow-hidden border bg-umber/5 transition-colors ${
                            sel
                              ? "border-espresso"
                              : "border-espresso/15 group-hover:border-espresso/50"
                          }`}
                        >
                          <img
                            src={c.swatch}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span
                          className={`text-xs ${sel ? "text-espresso" : "text-umber"}`}
                        >
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {grouped[attr].map((v) => {
                    const sel = v.attribute_value === selections[attr];
                    return (
                      <button
                        key={v.id}
                        type="button"
                        aria-pressed={sel}
                        disabled={v.stock_quantity <= 0}
                        onClick={() => pick(attr, v.attribute_value)}
                        className={`min-w-12 border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                          sel
                            ? "border-espresso bg-espresso text-ivory"
                            : "border-espresso/20 text-espresso hover:border-espresso"
                        }`}
                      >
                        {v.attribute_value}
                      </button>
                    );
                  })}
                </div>
              )}
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
        {outOfStock ? "Out of Stock" : added ? "Added to Bag" : "Add to Bag"}
      </button>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-espresso/10 pt-6">
        <div>
          <p className="text-sm text-espresso">
            {product.freeDelivery ? "Free Shipping" : "Shipping"}
          </p>
          <p className="text-xs text-umber">
            {product.freeDelivery ? "On this item" : "Calculated at checkout"}
          </p>
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
        {outOfStock ? "Out of stock" : "In stock"}
        {shipsText && !outOfStock ? ` · ${shipsText}` : ""}
        {stock !== null && stock > 0 && stock <= 5 ? ` · Only ${stock} left` : ""}
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
