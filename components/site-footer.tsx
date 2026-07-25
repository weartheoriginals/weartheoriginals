import Link from 'next/link';

const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      { label: 'Jackets', href: '/c/jackets' },
      { label: 'Coats', href: '/c/coats' },
      { label: 'Bags', href: '/c/bags' },
    ],
  },
  {
    heading: 'Customer Care',
    links: [
      { label: 'Shipping & Returns', href: '/shipping-returns' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Order Status', href: '/account/orders' },
    ],
  },
  {
    heading: 'The Atelier',
    links: [
      { label: 'Our Craft', href: '/about' },
      { label: 'Materials', href: '/materials' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-espresso/10 bg-ivory">
      <div className="mx-auto max-w-350 px-6 md:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <p className="font-display text-xl text-espresso mb-4">Wear The Originals</p>
            <p className="text-sm text-umber max-w-xs leading-relaxed">
              Be the first to hear about new arrivals and limited leather runs.
            </p>
            <form className="mt-5 flex border-b border-espresso/30 max-w-xs">
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="bg-transparent flex-1 py-2 text-sm text-espresso placeholder:text-umber/50 focus:outline-none"
              />
              <button type="submit" className="font-mono-label text-[11px] uppercase text-espresso stitch-underline">
                Submit
              </button>
            </form>
          </div>

          {FOOTER_COLUMNS.map(col => (
            <div key={col.heading}>
              <h3 className="font-mono-label text-[11px] uppercase text-brass mb-4">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-umber hover:text-espresso stitch-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="stitch-divider my-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-umber/70">© {new Date().getFullYear()} Wear The Originals. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs text-umber/70 hover:text-espresso stitch-underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-umber/70 hover:text-espresso stitch-underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
