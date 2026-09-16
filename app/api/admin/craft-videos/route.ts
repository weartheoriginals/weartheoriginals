import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  const { data, error } = await supabaseAdmin.from('craft_videos').select('*').order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  if (!body.title || !body.video_url) {
    return NextResponse.json({ success: false, error: 'title and video_url are required' }, { status: 400 });
  }

  const { data: last } = await supabaseAdmin
    .from('craft_videos')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabaseAdmin
    .from('craft_videos')
    .insert({
      title: body.title.trim(),
      caption: body.caption?.trim() || null,
      video_url: body.video_url,
      display_order: (last?.display_order ?? -1) + 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
