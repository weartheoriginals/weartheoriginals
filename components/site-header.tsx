"use client";

import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavCategory = { name: string; slug: string };

export default function SiteHeader({
  categories,
}: {
  categories: NavCategory[];
}) {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-ivory/90 backdrop-blur-sm border-b border-espresso/10 transition-[height] duration-300 ease-in-out`}
      >
        <div className="mx-auto max-w-350 px-6 md:px-10">
          <div
            className={`flex items-center justify-between transition-[height] duration-300 ease-in-out ${
              scrolled ? "h-16 md:h-16" : "h-24 md:h-24"
            }`}
          >
            <Link
              href="/"
              className="flex items-center pt-3"
              onClick={() => setMenuOpen(false)}
            >
              <Image
                src="/logo.png"
                alt="Wear The Originals"
                width={552}
                height={198}
                className={`w-auto transition-[height] duration-300 ease-in-out ${
                  scrolled ? "h-8 md:h-9" : "h-10 md:h-12"
                }`}
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-9">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/c/${category.slug}`}
                  className="stitch-underline font-mono-label text-[11px] uppercase text-umber hover:text-espresso transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/custom"
                className="stitch-underline font-mono-label text-[11px] uppercase text-umber hover:text-espresso transition-colors"
              >
                Custom
              </Link>
            </nav>

            <div className="flex items-center gap-6">
              <Link
                href="/cart"
                aria-label="View cart"
                className="font-mono-label text-[11px] uppercase text-umber hover:text-espresso stitch-underline"
              >
                Cart ({itemCount})
              </Link>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden relative z-50 w-6 h-5 flex flex-col justify-between"
              >
                <span
                  className={`block h-[0.5px] w-full bg-espresso transition-transform duration-300 ${
                    menuOpen ? "translate-y-2.25 rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[0.5px] w-full bg-espresso transition-opacity duration-300 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-[0.5px] w-full bg-espresso transition-transform duration-300 ${
                    menuOpen ? "-translate-y-2.25 -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen circle-reveal overlay */}
      <div
        aria-hidden={!menuOpen}
        className="md:hidden fixed inset-0 z-40 bg-espresso transition-[clip-path] duration-700 ease-in-out"
        style={{
          clipPath: menuOpen
            ? "circle(150% at calc(100% - 2.25rem) 2.5rem)"
            : "circle(0% at calc(100% - 2.25rem) 2.5rem)",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="absolute top-8 right-9 text-ivory text-3xl leading-none"
        >
          ×
        </button>

        <nav className="flex h-full flex-col items-center justify-center gap-8">
          {categories.map((category, i) => (
            <Link
              key={category.slug}
              href={`/c/${category.slug}`}
              onClick={() => setMenuOpen(false)}
              className="font-display text-3xl text-ivory transition-opacity duration-500"
              style={{
                transitionDelay: menuOpen ? `${150 + i * 80}ms` : "0ms",
                opacity: menuOpen ? 1 : 0,
              }}
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/custom"
            onClick={() => setMenuOpen(false)}
            className="font-display text-3xl text-ivory transition-opacity duration-500"
            style={{
              transitionDelay: menuOpen
                ? `${150 + categories.length * 80}ms`
                : "0ms",
              opacity: menuOpen ? 1 : 0,
            }}
          >
            Custom
          </Link>
        </nav>
      </div>
    </>
  );
}
