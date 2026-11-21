import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();
const BANNER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('site_banner').select('*').eq('id', BANNER_ID).maybeSingle();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const hasMobile = 'mobile_image_url' in body;

  if (!body.image_url && !hasMobile) {
    return NextResponse.json({ success: false, error: 'image_url or mobile_image_url is required' }, { status: 400 });
  }

  const row: Record<string, unknown> = { id: BANNER_ID, updated_at: new Date().toISOString() };
  if (body.image_url) row.image_url = body.image_url;
  if (hasMobile) row.mobile_image_url = body.mobile_image_url || null;

  const { data: existing } = await supabaseAdmin.from('site_banner').select('id').eq('id', BANNER_ID).maybeSingle();

  if (!existing && !body.image_url) {
    return NextResponse.json({ success: false, error: 'Upload the desktop image first' }, { status: 400 });
  }

  const { data, error } = await (existing
    ? supabaseAdmin.from('site_banner').update(row).eq('id', BANNER_ID).select().single()
    : supabaseAdmin.from('site_banner').insert(row).select().single());

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
