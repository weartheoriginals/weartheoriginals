import CategoryHero from '@/components/category-hero';
import ProductCard, { ProductCardData } from '@/components/product-card';
import { notFound } from 'next/navigation';

// TODO: replace with a real fetch to /api/products?category=<slug>
// Shape matches the `products` table joined with primary product_images + price.
const ALL_PRODUCTS: Record<string, ProductCardData[]> = {
  jackets: [
    {
      slug: 'harrington-tan-bomber',
      name: 'Harrington Bomber',
      price: 480,
      imageUrl: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
      tag: 'New',
    },
    {
      slug: 'moto-jacket-black',
      name: 'Moto Jacket',
      price: 560,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    },
    {
      slug: 'shearling-trucker',
      name: 'Shearling Trucker',
      price: 690,
      imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=800&auto=format&fit=crop',
      tag: 'Limited Stock',
    },
    {
      slug: 'suede-bomber-olive',
      name: 'Suede Bomber',
      price: 520,
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
    },
    {
      slug: 'canvas-chore-jacket',
      name: 'Canvas Chore Jacket',
      price: 390,
      imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=800&auto=format&fit=crop',
    },
  ],
  coats: [
    {
      slug: 'waxed-field-coat-espresso',
      name: 'Waxed Field Coat',
      price: 620,
      imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop',
    },
    {
      slug: 'long-overcoat-umber',
      name: 'Long Overcoat',
      price: 780,
      imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop',
      tag: 'New',
    },
    {
      slug: 'shearling-collar-coat',
      name: 'Shearling-Collar Coat',
      price: 860,
      imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop',
    },
  ],
  bags: [
    {
      slug: 'satchel-saddle-tan',
      name: 'The Fieldnote Satchel',
      price: 340,
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
      tag: 'Limited Stock',
    },
    {
      slug: 'weekender-duffel',
      name: 'Weekender Duffel',
      price: 410,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    },
    {
      slug: 'tote-espresso',
      name: 'The Atelier Tote',
      price: 290,
      imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop',
    },
    {
      slug: 'crossbody-brass',
      name: 'Crossbody, Brass Hardware',
      price: 260,
      imageUrl: 'https://images.unsplash.com/photo-1591561582301-7ce6588cc286?q=80&w=800&auto=format&fit=crop',
      tag: 'New',
    },
    {
      slug: 'briefcase-hard-sided',
      name: 'Hard-Sided Briefcase',
      price: 460,
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    },
  ],
};

const CATEGORY_COPY: Record<
  string,
  { title: string; description: string; heroCopy: string; imageUrl: string; imageAlt: string }
> = {
  jackets: {
    title: 'Jackets',
    description: 'Full-grain and suede, cut close and finished by hand. Built to break in, not break down.',
    heroCopy:
      'Every jacket starts as a full hide, chosen for the marks it already carries. Our cutters work with the grain, not against it — which means the leather is already breaking in before it ever reaches you.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1400&auto=format&fit=crop',
    imageAlt: 'Detail of a hand-stitched leather jacket collar',
  },
  coats: {
    title: 'Coats',
    description:
      'Weight for the season ahead. Waxed canvas, shearling collars, and long lines meant to last decades, not seasons.',
    heroCopy:
      'A coat has to earn its place in the rotation for years, not one winter. We build with waxed canvas and shearling that only gets better with weather — nothing here is precious about staying pristine.',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1400&auto=format&fit=crop',
    imageAlt: 'Waxed field coat draped over a wooden rail',
  },
  bags: {
    title: 'Bags',
    description: 'Structured for the day-to-day. Vegetable-tanned leather that darkens and softens the more it is used.',
    heroCopy:
      'Built to carry what a real day requires, and to look better for having done it. Vegetable-tanned leather takes on a patina from your hands, your desk, your commute — every bag ends up one of a kind.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1400&auto=format&fit=crop',
    imageAlt: 'Saddle-tan leather satchel on a workbench',
  },
};

const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low'];

export function generateStaticParams() {
  return Object.keys(ALL_PRODUCTS).map(category => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const products = ALL_PRODUCTS[category];
  const copy = CATEGORY_COPY[category];

  if (!products || !copy) {
    notFound();
  }

  return (
    <main>
      <CategoryHero
        eyebrow={`${products.length} ${products.length === 1 ? 'Piece' : 'Pieces'}`}
        title={copy.title}
        copy={copy.heroCopy}
        imageUrl={copy.imageUrl}
        imageAlt={copy.imageAlt}
      />

      <section className="mx-auto max-w-350 px-6 md:px-10">
        <div className="flex items-center justify-between py-6 border-b border-espresso/10">
          <div className="flex items-center gap-6">
            <span className="font-mono-label text-[11px] uppercase text-umber">Sort</span>
            <select
              defaultValue={SORT_OPTIONS[0]}
              aria-label="Sort products"
              className="font-mono-label text-[11px] uppercase text-espresso bg-transparent border-none focus:outline-none focus-visible:underline cursor-pointer"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <span className="font-mono-label text-[11px] uppercase text-umber hidden sm:inline">
            Showing {products.length} of {products.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12 py-12 md:py-16">
          {products.map(product => (
            <ProductCard key={product.slug} product={product} variant="grid" size="compact" />
          ))}
        </div>
      </section>
    </main>
  );
}
