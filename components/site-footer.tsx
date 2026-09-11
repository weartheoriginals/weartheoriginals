import { getSupabasePublic } from "@/lib/supabase";
import Link from "next/link";

const STATIC_COLUMNS = [
  {
    heading: "About",
    links: [
      { label: "About OGNLS", href: "/about" },
      { label: "Customization", href: "/customization" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Customer Care",
    links: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Processing Time", href: "/processing-time" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Leather Care Guide", href: "/leather-care" },
    ],
  },
];

async function getShopCategories() {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .is("parent_id", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load footer shop categories:", error);
    return [];
  }
  return data ?? [];
}

export default async function SiteFooter() {
  const shopCategories = await getShopCategories();

  return (
    <footer className="border-t border-espresso/10 bg-espresso">
      <div className="mx-auto max-w-350 px-6 md:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <p className="font-display text-xl text-ivory leading-tight">
                  OGNLS
                </p>
                <p className="font-mono-label text-[10px] uppercase text-ivory py-0.5">
                  Wear The Originals
                </p>
              </div>
              <div className="w-px h-10 bg-ivory/40 self-center" />
              <p className="text-sm text-ivory/60 leading-tight pt-1">
                Timeless leather.
                <br />
                Original character.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-mono-label text-[11px] uppercase text-brass mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {shopCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/c/${category.slug}`}
                    className="text-sm text-ivory/60 hover:text-brass stitch-underline"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {STATIC_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono-label text-[11px] uppercase text-brass mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ivory/60 hover:text-brass stitch-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-mono-label text-[11px] uppercase text-brass mb-3">
              Stay Connected
            </h3>
            <div className="flex gap-3 mb-5">
              <a
                href="#"
                aria-label="Instagram"
                className="text-ivory/60 hover:text-brass transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="text-ivory/60 hover:text-brass transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Pinterest"
                className="text-ivory/60 hover:text-brass transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M12 0a12 12 0 0 0-4.373 23.178c-.035-.947-.008-2.086.235-3.117.26-1.104 1.744-7.377 1.744-7.377s-.445-.89-.445-2.204c0-2.064 1.197-3.605 2.686-3.605 1.267 0 1.879.951 1.879 2.09 0 1.273-.812 3.178-1.229 4.944-.35 1.478.741 2.683 2.198 2.683 2.638 0 4.417-3.39 4.417-7.406 0-3.053-2.056-5.34-5.797-5.34-4.225 0-6.86 3.151-6.86 6.667 0 1.213.358 2.069.919 2.732.258.305.294.428.2.779-.067.257-.221.878-.285 1.123-.093.354-.38.481-.7.35-1.954-.797-2.864-2.936-2.864-5.342 0-3.972 3.35-8.735 9.988-8.735 5.336 0 8.849 3.863 8.849 8.011 0 5.487-3.033 9.586-7.499 9.586-1.502 0-2.913-.808-3.396-1.73l-.936 3.68c-.278 1.023-.824 2.046-1.324 2.842A12 12 0 1 0 12 0z" />
                </svg>
              </a>
            </div>

            <form className="flex items-stretch border border-ivory/20 h-11 max-w-sm">
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                className="bg-transparent flex-1 min-w-0 px-3 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center w-8 bg-ivory/10 text-ivory hover:bg-brass hover:text-espresso transition-colors"
              >
                →
              </button>
            </form>
          </div>
        </div>

        <hr className="stitch-divider-dark my-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-ivory/40">
            © {new Date().getFullYear()} Wear The Originals. All rights
            reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-xs text-ivory/40 hover:text-brass stitch-underline"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-ivory/40 hover:text-brass stitch-underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie-policy"
              className="text-xs text-ivory/40 hover:text-brass stitch-underline"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
