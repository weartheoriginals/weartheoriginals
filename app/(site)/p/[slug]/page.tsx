import { ProductCardData } from '@/components/product-card';
import ProductDetailPanel from '@/components/product-detail-panel';
import ProductGallery from '@/components/product-gallery';
import ProductShelf from '@/components/product-shelf';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products';
import type { ProductWithImages } from '@/lib/types';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { notFound } from 'next/navigation';

function toProductCardData(product: ProductWithImages): ProductCardData {
  const primaryImage = product.images.find(img => img.is_primary) ?? product.images[0];
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: primaryImage ? getProductImageUrl(primaryImage.image_url) : PLACEHOLDER_IMAGE,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const sortedImages = [...product.images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });
  const galleryImages =
    sortedImages.length > 0 ? sortedImages.map(img => getProductImageUrl(img.image_url)) : [PLACEHOLDER_IMAGE];

  const relatedProducts = product.category_id
    ? (await getRelatedProducts(product.category_id, product.id)).map(toProductCardData)
    : [];

  return (
    <main>
      <section className="mx-auto max-w-350 px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <ProductGallery images={galleryImages} productName={product.name} />
          <ProductDetailPanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            description={product.description ?? ''}
            imageUrl={galleryImages[0]}
            variants={product.variants}
          />
        </div>
      </section>
      {relatedProducts.length > 0 && (
        <div className="border-t border-espresso/10">
          <ProductShelf eyebrow="You May Also Like" title="Complete the Look" products={relatedProducts} />
        </div>
      )}
    </main>
  );
}
