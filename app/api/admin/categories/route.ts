import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { toSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*, parent:categories!parent_id(id, name, slug)')
    .order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 });
  }

  const slug = body.slug ? toSlug(body.slug) : toSlug(body.name);

  const { data: last } = await supabaseAdmin
    .from('categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const display_order = (last?.display_order ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: body.name.trim(),
      slug,
      parent_id: body.parent_id || null,
      image_url: body.image_url || null,
      display_order: body.display_order ?? display_order,
      hero_copy: body.hero_copy?.trim() || null,
      hero_image_alt: body.hero_image_alt?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    const msg = error.code === '23505' ? 'A category with this slug already exists' : error.message;
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
  return NextResponse.json({ success: true, data }, { status: 201 });
}
