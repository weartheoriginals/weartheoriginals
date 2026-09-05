import type { Category } from '@/lib/types';
import { getSupabasePublic } from '../supabase';

export async function getAllCategories(): Promise<Category[]> {
  const supabase = getSupabasePublic();

  const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });

  if (error) {
    console.error('getAllCategories error:', error.message);
    return [];
  }
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabasePublic();

  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('getCategoryBySlug error:', error.message);
    }
    return null;
  }
  return data as Category;
}
