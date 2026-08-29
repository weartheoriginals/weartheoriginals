import { ProductCardData } from '@/components/product-card';
import ProductDetailPanel, { CustomizationOption } from '@/components/product-detail-panel';
import ProductGallery from '@/components/product-gallery';
import ProductShelf from '@/components/product-shelf';
import { notFound } from 'next/navigation';

type ProductDetail = {
  slug: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  customizations: CustomizationOption[];
};

const PRODUCTS: Record<string, ProductDetail> = {
  'moto-jacket-black': {
    slug: 'moto-jacket-black',
    name: 'Moto Jacket',
    price: 560,
    description:
      'Cut close through the body with an asymmetric zip and a collar that softens with wear. Full-grain leather, finished by hand — this is a jacket built to be lived in, not preserved.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
    ],
    customizations: [
      { label: 'Handle', choices: ['Tan', 'Espresso', 'Black'] },
      { label: 'Flap', choices: ['Structured', 'Soft'] },
      { label: 'Body', choices: ['Full-Grain', 'Suede'] },
    ],
  },
};

const RELATED_PRODUCTS: ProductCardData[] = [
  {
    slug: 'harrington-tan-bomber',
    name: 'Harrington Bomber',
    price: 480,
    imageUrl: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
    tag: 'New',
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
    slug: 'weekender-duffel',
    name: 'Weekender Duffel',
    price: 410,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
  },
];

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map(slug => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = PRODUCTS[slug];

  if (!product) {
    notFound();
  }

  return (
    <main>
      <section className="mx-auto max-w-350 px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductDetailPanel
            slug={product.slug}
            name={product.name}
            price={product.price}
            description={product.description}
            imageUrl={product.images[0]}
            customizations={product.customizations}
          />
        </div>
      </section>

      <div className="border-t border-espresso/10">
        <ProductShelf eyebrow="You May Also Like" title="Complete the Look" products={RELATED_PRODUCTS} />
      </div>
    </main>
  );
}
