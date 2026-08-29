import EditorialBlock from '@/components/editorial-block';
import Hero from '@/components/hero';
import { ProductCardData } from '@/components/product-card';
import ProductShelf from '@/components/product-shelf';

// TODO: replace with a real fetch to /api/products?is_featured=true
// Shape matches the `products` table joined with primary product_images + price.
const FEATURED_PRODUCTS: ProductCardData[] = [
  {
    slug: 'harrington-tan-bomber',
    name: 'Harrington Bomber',
    price: 480,
    imageUrl: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
    tag: 'New',
  },
  {
    slug: 'waxed-field-coat-espresso',
    name: 'Waxed Field Coat',
    price: 620,
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'satchel-saddle-tan',
    name: 'The Fieldnote Satchel',
    price: 340,
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    tag: 'Limited Stock',
  },
  {
    slug: 'moto-jacket-black',
    name: 'Moto Jacket',
    price: 560,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
  },
  {
    slug: 'weekender-duffel',
    name: 'Weekender Duffel',
    price: 410,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
];

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ProductShelf eyebrow="Just In" title="Featured This Season" products={FEATURED_PRODUCTS} />
      <EditorialBlock
        eyebrow="The Atelier"
        title="Cut and stitched by hand, one hide at a time."
        copy="Every jacket begins as a single full-grain hide, inspected under daylight for the story it already carries. Our pattern cutters work around each mark, not around a template — which is why no two pieces are ever quite the same."
        ctaLabel="Meet the Makers"
        href="/about"
        imageUrl="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1400&auto=format&fit=crop"
        imageAlt="Leatherworker hand-stitching a jacket seam at a workbench"
      />
      <EditorialBlock
        eyebrow="Materials"
        title="Full-grain, vegetable-tanned, built to age well."
        copy="We work almost exclusively in vegetable-tanned full-grain leather — no corrected surfaces, no shortcuts. It scuffs, it darkens, it molds to how you actually live in it. That's not a flaw to manage; it's the whole point."
        ctaLabel="Explore Materials"
        href="/materials"
        imageUrl="https://images.unsplash.com/photo-1601924582971-c65b471bb8d0?q=80&w=1400&auto=format&fit=crop"
        imageAlt="Rolls of vegetable-tanned leather in tan and espresso tones"
        reverse
      />
      <ProductShelf eyebrow="Carry" title="Bags & Accessories" products={FEATURED_PRODUCTS.slice(2)} />
    </main>
  );
}
