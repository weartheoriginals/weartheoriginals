import { getSupabasePublic } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ success: false }, { status: 400 });

  const { data } = await getSupabasePublic()
    .from('products')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!data) return NextResponse.json({ success: false }, { status: 404 });

  // Best-effort guess of the product type from the name; falls back to leaving the current selection
  const n = data.name.toLowerCase();
  const product_type = n.includes('bomber')
    ? 'bomber'
    : n.includes('trench')
      ? 'trench_coat'
      : n.includes('wallet')
        ? 'wallet'
        : n.includes('bag')
          ? 'bag'
          : n.includes('jacket')
            ? 'leather_jacket'
            : null;

  return NextResponse.json({ success: true, data: { id: data.id, product_type } });
}
