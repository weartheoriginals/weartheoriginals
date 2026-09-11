"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";

type NavCategory = { name: string; slug: string };

export default function SiteHeader({
  categories,
}: {
  categories: NavCategory[];
}) {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-sm border-b border-espresso/10">
      <div className="mx-auto max-w-350 px-6 md:px-10">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="font-display text-xl md:text-2xl tracking-wide text-espresso"
          >
            Wear The Originals
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/c/${category.slug}`}
                className="stitch-underline font-mono-label text-[12px] uppercase text-umber hover:text-espresso transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/cart"
              aria-label="View cart"
              className="font-mono-label text-[12px] uppercase text-umber hover:text-espresso stitch-underline"
            >
              Cart ({itemCount})
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
