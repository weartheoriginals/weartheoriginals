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
  if (!body.image_url) {
    return NextResponse.json({ success: false, error: 'image_url is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('site_banner')
    .upsert({ id: BANNER_ID, image_url: body.image_url, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
