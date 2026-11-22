import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('lookbook_images').select('*').order('display_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { image_urls } = await request.json();
  if (!Array.isArray(image_urls) || image_urls.length === 0) {
    return NextResponse.json({ error: 'image_urls must be a non-empty array' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: last } = await supabase
    .from('lookbook_images')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const start = (last?.display_order ?? -1) + 1;
  const rows = image_urls.map((url: string, i: number) => ({
    image_url: url,
    display_order: start + i,
  }));

  const { data, error } = await supabase.from('lookbook_images').insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
