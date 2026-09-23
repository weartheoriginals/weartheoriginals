import EditorialBlock from "@/components/editorial-block";
import Hero from "@/components/hero";
import { ProductCardData } from "@/components/product-card";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ProductWithImages } from "@/lib/types";
import { getProductImageUrl, PLACEHOLDER_IMAGE } from "@/lib/utils";

function toProductCardData(product: ProductWithImages): ProductCardData {
  const primaryImage =
    product.images.find((img) => img.is_primary) ?? product.images[0];
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: primaryImage
      ? getProductImageUrl(primaryImage.image_url)
      : PLACEHOLDER_IMAGE,
  };
}

async function getHomeSections() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("home_sections")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load home sections:", error);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const sections = await getHomeSections();

  return (
    <main>
      <Hero />
      {sections.map((section, index) => (
        <EditorialBlock
          key={section.id}
          eyebrow={section.eyebrow}
          title={section.title}
          copy={section.description}
          ctaLabel={section.button_label}
          href={section.button_href}
          imageUrl={section.image_url}
          reverse={index % 2 === 1}
        />
      ))}
    </main>
  );
}
