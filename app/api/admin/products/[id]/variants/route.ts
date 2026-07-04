import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

// GET all variants for a product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .select('*, image:product_images(*)')
    .eq('product_id', id)
    .order('attribute_name', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// POST — add a variant (e.g. { attribute_name: "Size", attribute_value: "M", stock_quantity: 10, image_id: null })
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.attribute_name?.trim() || !body.attribute_value?.trim()) {
    return NextResponse.json({ success: false, error: 'attribute_name and attribute_value are required' }, { status: 400 });
  }

  const { data: last } = await supabaseAdmin
    .from('product_variants')
    .select('display_order')
    .eq('product_id', id)
    .eq('attribute_name', body.attribute_name.trim())
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = body.display_order ?? (last?.display_order ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .insert({
      product_id: id,
      attribute_name: body.attribute_name.trim(),
      attribute_value: body.attribute_value.trim(),
      stock_quantity: parseInt(body.stock_quantity ?? 0),
      image_id: body.image_id || null,
      display_order,
    })
    .select('*, image:product_images(*)')
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}

// PUT — update a variant (?variant_id=...)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const variant_id = searchParams.get('variant_id');
  if (!variant_id) {
    return NextResponse.json({ success: false, error: 'variant_id query param is required' }, { status: 400 });
  }

  const body = await request.json();
  const updates: Record<string, any> = {};
  if (body.attribute_name !== undefined) updates.attribute_name = body.attribute_name.trim();
  if (body.attribute_value !== undefined) updates.attribute_value = body.attribute_value.trim();
  if (body.stock_quantity !== undefined) updates.stock_quantity = parseInt(body.stock_quantity);
  if (body.image_id !== undefined) updates.image_id = body.image_id || null;
  if (body.display_order !== undefined) updates.display_order = body.display_order;

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update(updates)
    .eq('id', variant_id)
    .eq('product_id', id)
    .select('*, image:product_images(*)')
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

// DELETE — remove a variant (?variant_id=...)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const variant_id = searchParams.get('variant_id');
  if (!variant_id) {
    return NextResponse.json({ success: false, error: 'variant_id query param is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('product_variants').delete().eq('id', variant_id).eq('product_id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
