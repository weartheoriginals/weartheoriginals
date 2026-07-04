import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

// GET all images for a product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('product_images')
    .select('*')
    .eq('product_id', id)
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// POST — add an image (upload already done client-side to Storage; this just registers the row)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.image_url) {
    return NextResponse.json({ success: false, error: 'image_url is required' }, { status: 400 });
  }

  // If this image is marked primary, unset any existing primary for this product first
  if (body.is_primary) {
    await supabaseAdmin.from('product_images').update({ is_primary: false }).eq('product_id', id);
  }

  const { data: last } = await supabaseAdmin
    .from('product_images')
    .select('display_order')
    .eq('product_id', id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = body.display_order ?? (last?.display_order ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from('product_images')
    .insert({
      product_id: id,
      image_url: body.image_url,
      is_primary: body.is_primary ?? false,
      display_order,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}

// DELETE — remove a single image by image id (?image_id=...)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const image_id = searchParams.get('image_id');
  if (!image_id) {
    return NextResponse.json({ success: false, error: 'image_id query param is required' }, { status: 400 });
  }

  // Any variants pointing to this image get image_id set to NULL automatically (ON DELETE SET NULL)
  const { error } = await supabaseAdmin.from('product_images').delete().eq('id', image_id).eq('product_id', id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
