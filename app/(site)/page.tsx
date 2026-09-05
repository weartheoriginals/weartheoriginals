import EditorialBlock from '@/components/editorial-block';
import Hero from '@/components/hero';
import { ProductCardData } from '@/components/product-card';
import ProductShelf from '@/components/product-shelf';
import { getFeaturedProducts } from '@/lib/queries/products';
import type { ProductWithImages } from '@/lib/types';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils';

function toProductCardData(product: ProductWithImages): ProductCardData {
  const primaryImage = product.images.find(img => img.is_primary) ?? product.images[0];
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: primaryImage ? getProductImageUrl(primaryImage.image_url) : PLACEHOLDER_IMAGE,
  };
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8);
  const cardProducts = featuredProducts.map(toProductCardData);

  return (
    <main>
      <Hero />
      <ProductShelf eyebrow="Just In" title="Featured This Season" products={cardProducts} />
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
      <ProductShelf eyebrow="Carry" title="Bags & Accessories" products={cardProducts.slice(2)} />
    </main>
  );
}
