import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { ProductWithDetails, ProductWithImages } from '@/lib/types';

export async function getFeaturedProducts(limit = 8): Promise<ProductWithImages[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getFeaturedProducts error:', error.message);
    return [];
  }
  return data as ProductWithImages[];
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<ProductWithImages[]> {
  const supabase = await createSupabaseServerClient();

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError || !category) {
    console.error('getProductsByCategorySlug: category not found for slug', categorySlug);
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('is_active', true)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getProductsByCategorySlug error:', error.message);
    return [];
  }
  return data as ProductWithImages[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, expected for a bad slug — anything else is worth logging
      console.error('getProductBySlug error:', error.message);
    }
    return null;
  }
  return data as ProductWithDetails;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ProductWithImages[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(limit);

  if (error) {
    console.error('getRelatedProducts error:', error.message);
    return [];
  }
  return data as ProductWithImages[];
}
