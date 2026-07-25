import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Jackets', href: '/c/jackets' },
  { label: 'Coats', href: '/c/coats' },
  { label: 'Bags', href: '/c/bags' },
  { label: 'The Atelier', href: '/about' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-sm border-b border-espresso/10">
      <div className="mx-auto max-w-350 px-6 md:px-10">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="font-display text-xl md:text-2xl tracking-wide text-espresso">
            Wear The Originals
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="stitch-underline font-mono-label text-[11px] uppercase text-umber hover:text-espresso transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/search"
              aria-label="Search"
              className="font-mono-label text-[11px] uppercase text-umber hover:text-espresso stitch-underline hidden sm:inline"
            >
              Search
            </Link>
            <Link
              href="/cart"
              aria-label="View cart"
              className="font-mono-label text-[11px] uppercase text-umber hover:text-espresso stitch-underline"
            >
              Cart (0)
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
