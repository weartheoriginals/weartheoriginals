import { isCustomType } from '@/lib/custom-request-types';
import { getSupabasePublic } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ success: false }, { status: 400 });

  const db = getSupabasePublic();

  const { data: product } = await db
    .from('products')
    .select('id, name, category_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) return NextResponse.json({ success: false }, { status: 404 });

  let productType: string | null = null;
  let categoryId: string | null = product.category_id;

  for (let i = 0; i < 3 && categoryId && !productType; i++) {
    const { data: cat } = await db.from('categories').select('custom_type, parent_id').eq('id', categoryId).maybeSingle();
    if (!cat) break;
    productType = isCustomType(cat.custom_type) ? cat.custom_type : null;
    categoryId = cat.parent_id;
  }

  return NextResponse.json({
    success: true,
    data: { id: product.id, name: product.name, product_type: productType },
  });
}
