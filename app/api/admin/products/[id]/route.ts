import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() ?? null;
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.price !== undefined) updates.price = parseFloat(body.price);
  if (body.is_featured !== undefined) updates.is_featured = body.is_featured;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.brand_name !== undefined) updates.brand_name = body.brand_name?.trim() || null;
  if (body.materials !== undefined) updates.materials = body.materials?.trim() || null;
  if (body.features !== undefined)
    updates.features = Array.isArray(body.features) ? body.features.filter((f: string) => f.trim()) : null;
  if (body.processing_days_min !== undefined)
    updates.processing_days_min = body.processing_days_min === null ? null : parseInt(body.processing_days_min);
  if (body.processing_days_max !== undefined)
    updates.processing_days_max = body.processing_days_max === null ? null : parseInt(body.processing_days_max);
  if (body.return_policy !== undefined) updates.return_policy = body.return_policy?.trim() || null;
  if (body.shipping_from !== undefined) updates.shipping_from = body.shipping_from?.trim() || null;
  if (body.free_delivery !== undefined) updates.free_delivery = body.free_delivery;

  const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
