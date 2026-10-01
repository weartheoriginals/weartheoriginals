"use client";

import type { RelatedCard } from "@/lib/product-ui";
import Link from "next/link";
import { useRef } from "react";
import StarRating from "./star-rating";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Scroll right" : "Scroll left"}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center border border-espresso/20 text-espresso transition-colors hover:border-espresso"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d={dir === 1 ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
      </svg>
    </button>
  );
}

export default function RelatedShelf({ products }: { products: RelatedCard[] }) {
  const track = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="border-t border-espresso/10">
      <div className="mx-auto max-w-350 px-6 py-14 md:px-10 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display font-light text-2xl md:text-3xl text-espresso">
            You May Also Like
          </h2>
          <div className="hidden gap-2 md:flex">
            <Arrow dir={-1} onClick={() => scroll(-1)} />
            <Arrow dir={1} onClick={() => scroll(1)} />
          </div>
        </div>

        <div
          ref={track}
          className="shelf-scroll -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:-mx-10 md:gap-6 md:px-10"
        >
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group w-44 shrink-0 snap-start md:w-56"
            >
              <div className="aspect-4/5 overflow-hidden bg-umber/5">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-sm text-espresso">{p.name}</p>
              <p className="mt-1 font-mono-label text-sm text-umber">
                {formatPrice(p.price)}
              </p>
              <div className="mt-1.5">
                <StarRating compact rating={p.rating} count={p.count} />
              </div>
              {p.colors.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {p.colors.slice(0, 5).map((c, i) => (
                    <span
                      key={i}
                      className="h-3 w-3 rounded-full border border-espresso/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
