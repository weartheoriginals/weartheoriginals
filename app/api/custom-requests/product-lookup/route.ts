import { getSupabasePublic } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ success: false }, { status: 400 });

  const { data } = await getSupabasePublic()
    .from('products')
    .select('id, category:categories(slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!data) return NextResponse.json({ success: false }, { status: 404 });

  const category = Array.isArray(data.category) ? data.category[0] : data.category;

  return NextResponse.json({
    success: true,
    data: { id: data.id, product_type: category?.slug ?? null },
  });
}
