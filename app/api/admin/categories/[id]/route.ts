import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { toSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*, parent:categories!parent_id(id, name, slug)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.slug !== undefined) updates.slug = toSlug(body.slug);
  if (body.parent_id !== undefined) updates.parent_id = body.parent_id || null;
  if (body.image_url !== undefined) updates.image_url = body.image_url || null;
  if (body.display_order !== undefined) updates.display_order = body.display_order;
  if (body.hero_copy !== undefined) updates.hero_copy = body.hero_copy?.trim() || null;
  if (body.hero_image_alt !== undefined) updates.hero_image_alt = body.hero_image_alt?.trim() || null;

  const { data, error } = await supabaseAdmin.from('categories').update(updates).eq('id', id).select().single();

  if (error) {
    const msg = error.code === '23505' ? 'A category with this slug already exists' : error.message;
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
  if (!data) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
