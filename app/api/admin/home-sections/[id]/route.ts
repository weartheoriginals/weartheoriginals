import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const update: Record<string, unknown> = {};
  if ('eyebrow' in body) update.eyebrow = body.eyebrow?.trim() || null;
  if ('title' in body) {
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
    }
    update.title = body.title.trim();
  }
  if ('description' in body) update.description = body.description?.trim() || null;
  if ('image_url' in body) update.image_url = body.image_url || null;
  if ('button_label' in body) update.button_label = body.button_label?.trim() || null;
  if ('button_href' in body) update.button_href = body.button_href?.trim() || null;
  if ('is_visible' in body) update.is_visible = !!body.is_visible;

  if (('button_label' in update || 'button_href' in update) && !!update.button_label !== !!update.button_href) {
    return NextResponse.json({ error: 'button_label and button_href must be provided together' }, { status: 400 });
  }

  const { data, error } = await supabase.from('home_sections').update(update).eq('id', id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('home_sections').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
