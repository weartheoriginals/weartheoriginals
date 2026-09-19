import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const includeHidden = request.nextUrl.searchParams.get('all') === 'true';

  // Hidden sections are only visible to admins
  if (includeHidden) {
    const { error: authError } = await requireAdmin(request);
    if (authError) return authError;
  }

  let query = supabase.from('home_sections').select('*').order('display_order', { ascending: true });

  if (!includeHidden) query = query.eq('is_visible', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const body = await request.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  const hasLabel = !!body.button_label?.trim();
  const hasHref = !!body.button_href?.trim();
  if (hasLabel !== hasHref) {
    return NextResponse.json({ error: 'button_label and button_href must be provided together' }, { status: 400 });
  }

  const { data: last } = await supabase
    .from('home_sections')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('home_sections')
    .insert({
      eyebrow: body.eyebrow?.trim() || null,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      image_url: body.image_url || null,
      button_label: body.button_label?.trim() || null,
      button_href: body.button_href?.trim() || null,
      is_visible: body.is_visible ?? true,
      display_order: (last?.display_order ?? -1) + 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
