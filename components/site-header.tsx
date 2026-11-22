'use client';

import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavCategory = { name: string; slug: string };

export default function SiteHeader({ categories }: { categories: NavCategory[] }) {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  const headerClass = transparent
    ? 'bg-transparent border-b border-transparent text-ivory'
    : 'bg-ivory/90 backdrop-blur-sm border-b border-espresso/10 text-espresso';

  const linkBase =
    'font-mono-label whitespace-nowrap text-[12px] 2xl:text-[13px] uppercase underline-offset-8 decoration-1 hover:underline transition-colors';
  const linkColor = transparent ? 'text-ivory' : 'text-umber hover:text-espresso';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {!isHome && <div className="h-16.25 md:h-20.25" />}
      <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${headerClass}`}>
        <div className="mx-auto max-w-350 px-6 md:px-10">
          <div
            className={`grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-300 ease-in-out ${
              scrolled ? 'h-14' : 'h-16 md:h-20'
            }`}
          >
            {/* Left: hamburger (mobile) / categories (desktop) */}
            <div className="flex items-center">
              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
                className="xl:hidden relative z-50 w-6 h-5 flex flex-col justify-between"
              >
                <span
                  className={`block h-[0.5px] w-full bg-current transition-transform duration-300 ${
                    menuOpen ? 'translate-y-2.25 rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-[0.5px] w-full bg-current transition-opacity duration-300 ${
                    menuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`block h-[0.5px] w-full bg-current transition-transform duration-300 ${
                    menuOpen ? '-translate-y-2.25 -rotate-45' : ''
                  }`}
                />
              </button>

              <nav className="hidden xl:flex items-center gap-5 2xl:gap-7">
                {categories.map(category => {
                  const href = `/c/${category.slug}`;
                  return (
                    <Link
                      key={category.slug}
                      href={href}
                      className={`${linkBase} ${linkColor} ${isActive(href) ? 'underline' : ''}`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
                <Link href="/custom" className={`${linkBase} ${linkColor} ${isActive('/custom') ? 'underline' : ''}`}>
                  Custom
                </Link>
              </nav>
            </div>

            {/* Center: logo */}
            <Link href="/" className="flex items-center justify-center pt-2" onClick={() => setMenuOpen(false)}>
              <Image
                src="/logo.png"
                alt="Wear The Originals"
                width={552}
                height={198}
                className={`w-auto transition-[height] duration-300 ease-in-out ${scrolled ? 'h-7 md:h-8' : 'h-9 md:h-11'}`}
                priority
              />
            </Link>

            {/* Right: cart */}
            <div className="flex items-center justify-end">
              <Link href="/cart" aria-label={`View cart (${itemCount})`} className="relative">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 8h14l-1 12H6L5 8Z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                {itemCount > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono-label text-[9px] ${
                      transparent ? 'bg-ivory text-espresso' : 'bg-espresso text-ivory'
                    }`}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen circle-reveal overlay */}
      <div
        aria-hidden={!menuOpen}
        className="xl:hidden fixed inset-0 z-40 bg-espresso transition-[clip-path] duration-700 ease-in-out"
        style={{
          clipPath: menuOpen ? 'circle(150% at 2.25rem 2rem)' : 'circle(0% at 2.25rem 2rem)',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 left-6 text-ivory text-3xl leading-none"
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
                transitionDelay: menuOpen ? `${150 + i * 80}ms` : '0ms',
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
              transitionDelay: menuOpen ? `${150 + categories.length * 80}ms` : '0ms',
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
