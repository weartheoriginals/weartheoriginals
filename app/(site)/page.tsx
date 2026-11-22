import CategoryTiles from '@/components/category-tiles';
import Lookbook from '@/components/lookbook';
import EditorialBlock from '@/components/editorial-block';
import Hero from '@/components/hero';
import { ProductCardData } from '@/components/product-card';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { ProductWithImages } from '@/lib/types';
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function toProductCardData(product: ProductWithImages): ProductCardData {
  const primaryImage = product.images.find(img => img.is_primary) ?? product.images[0];
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: primaryImage ? getProductImageUrl(primaryImage.image_url) : PLACEHOLDER_IMAGE,
  };
}

async function getHomeSections() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('home_sections')
    .select('*')
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to load home sections:', error);
    return [];
  }
  return data ?? [];
}

async function getHomeCategories() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug, image_url')
    .is('parent_id', null)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to load home categories:', error);
    return [];
  }
  return data ?? [];
}

async function getLookbookImages() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('lookbook_images')
    .select('id, image_url')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to load lookbook images:', error);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const [sections, categories, lookbook] = await Promise.all([getHomeSections(), getHomeCategories(), getLookbookImages()]);

  return (
    <main>
      <Hero />
      <CategoryTiles categories={categories} />
      <Lookbook images={lookbook} />
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
