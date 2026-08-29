import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPaginationRange, toSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
  const search = searchParams.get('search')?.trim() ?? '';
  const { from, to } = getPaginationRange(page, limit);

  let query = supabaseAdmin
    .from('products')
    .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    data: { data, total: count ?? 0, page, limit, total_pages: Math.ceil((count ?? 0) / limit) },
  });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();

  if (!body.name || !body.category_id || body.price === undefined) {
    return NextResponse.json({ success: false, error: 'name, category_id and price are required' }, { status: 400 });
  }

  const slug = toSlug(body.name) + '-' + Date.now().toString(36);

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: body.name.trim(),
      slug,
      description: body.description?.trim() ?? null,
      category_id: body.category_id,
      price: parseFloat(body.price),
      is_featured: body.is_featured ?? false,
      is_active: body.is_active ?? true,
      brand_name: body.brand_name?.trim() || null,
      materials: body.materials?.trim() || null,
      features: Array.isArray(body.features) ? body.features.filter((f: string) => f.trim()) : null,
      processing_days_min: body.processing_days_min !== undefined ? parseInt(body.processing_days_min) : null,
      processing_days_max: body.processing_days_max !== undefined ? parseInt(body.processing_days_max) : null,
      return_policy: body.return_policy?.trim() || null,
      shipping_from: body.shipping_from?.trim() || null,
      free_delivery: body.free_delivery ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
