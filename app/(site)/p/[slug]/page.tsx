import ProductFeatureBanner from "@/components/product-feature-banner";
import ProductTabs from "@/components/product-tabs";
import ProductView from "@/components/product-view";
import RelatedShelf from "@/components/related-shelf";
import {
  colorToCss,
  getFakeRating,
  isColorAttribute,
  type RelatedCard,
} from "@/lib/product-ui";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import type { ProductWithDetails } from "@/lib/types";
import { getProductImageUrl, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { notFound } from "next/navigation";

function toRelatedCard(product: ProductWithDetails): RelatedCard {
  const primary = product.images.find((img) => img.is_primary) ?? product.images[0];
  const colors = product.variants
    .filter((v) => isColorAttribute(v.attribute_name))
    .sort((a, b) => a.display_order - b.display_order)
    .map((v) => colorToCss(v.attribute_value));

  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: primary ? getProductImageUrl(primary.image_url) : PLACEHOLDER_IMAGE,
    colors,
    ...getFakeRating(product.slug),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const sortedImages = [...product.images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });
  const images = sortedImages.length
    ? sortedImages.map((img) => ({
        id: img.id,
        url: getProductImageUrl(img.image_url),
        variantId: img.variant_id ?? null,
      }))
    : [{ id: "placeholder", url: PLACEHOLDER_IMAGE, variantId: null }];

  // Shared images (no color) become the detail shots in the banner,
  // but only when the product has colors. Otherwise they are the gallery.
  const hasColors = product.variants.some((v) => isColorAttribute(v.attribute_name));
  const detailImages = hasColors
    ? images
        .filter((i) => !i.variantId)
        .slice(0, 4)
        .map((i) => i.url)
    : [];

  const relatedProducts = product.category_id
    ? (await getRelatedProducts(product.category_id, product.id, 8)).map(
        toRelatedCard,
      )
    : [];

  const brand = product.brand_name ?? "OGNLS";

  return (
    <main>
      <section className="mx-auto max-w-350 px-6 md:px-10 py-12 md:py-16">
        <ProductView
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            brand,
            price: product.price,
            description: product.description ?? "",
            freeDelivery: product.free_delivery,
            processingMin: product.processing_days_min,
            processingMax: product.processing_days_max,
          }}
          variants={product.variants}
          images={images}
        />
      </section>

      <section className="mx-auto max-w-350 px-6 md:px-10 pb-14 md:pb-20">
        <ProductTabs
          description={product.description ?? ""}
          features={product.features}
          materials={product.materials}
          brand={brand}
          processingMin={product.processing_days_min}
          processingMax={product.processing_days_max}
          shippingFrom={product.shipping_from}
          freeDelivery={product.free_delivery}
          returnPolicy={product.return_policy}
        />
        <ProductFeatureBanner images={detailImages} />
      </section>

      {relatedProducts.length > 0 && <RelatedShelf products={relatedProducts} />}
    </main>
  );
}
