import CategoryHero from '@/components/category-hero';
import ProductCard, { ProductCardData } from '@/components/product-card';
import { getAllCategories, getCategoryBySlug } from '@/lib/queries/categories';
import { getProductsByCategorySlug } from '@/lib/queries/products';
import type { ProductWithImages } from '@/lib/types';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { notFound } from 'next/navigation';

const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low'];

function toProductCardData(product: ProductWithImages): ProductCardData {
  const primaryImage = product.images.find(img => img.is_primary) ?? product.images[0];
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: primaryImage ? getProductImageUrl(primaryImage.image_url) : PLACEHOLDER_IMAGE,
  };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map(category => ({ category: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const products = (await getProductsByCategorySlug(categorySlug)).map(toProductCardData);

  return (
    <main>
      <CategoryHero
        eyebrow={`${products.length} ${products.length === 1 ? 'Piece' : 'Pieces'}`}
        title={category.name}
        copy={category.hero_copy ?? ''}
        imageUrl={category.image_url ?? PLACEHOLDER_IMAGE}
        imageAlt={category.hero_image_alt ?? category.name}
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

        {products.length === 0 ? (
          <p className="py-16 text-center text-umber">No pieces available in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-5 gap-y-10 md:gap-x-6 md:gap-y-12 py-12 md:py-16">
            {products.map(product => (
              <ProductCard key={product.slug} product={product} variant="grid" size="compact" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
