import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: req } = await supabaseAdmin.from('custom_requests').select('id, status').eq('id', id).single();

  if (!req || req.status !== 'awaiting_files') {
    return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
  }

  const { data: files } = await supabaseAdmin.from('custom_request_files').select('id, file_path').eq('request_id', id);

  // Verify each file actually landed in storage
  const landedIds: string[] = [];
  for (const f of files ?? []) {
    const lastSlash = f.file_path.lastIndexOf('/');
    const folder = f.file_path.slice(0, lastSlash);
    const name = f.file_path.slice(lastSlash + 1);
    const { data: found } = await supabaseAdmin.storage.from('custom-request-files').list(folder, { search: name });
    if (found?.some(o => o.name === name)) landedIds.push(f.id);
  }

  if (landedIds.length !== (files ?? []).length) {
    return NextResponse.json({ success: false, error: 'Some files did not finish uploading' }, { status: 400 });
  }

  await supabaseAdmin.from('custom_request_files').update({ uploaded: true }).in('id', landedIds);

  await supabaseAdmin
    .from('custom_requests')
    .update({ status: 'submitted', updated_at: new Date().toISOString() })
    .eq('id', id);

  await supabaseAdmin.from('custom_request_status_history').insert({ request_id: id, status: 'submitted' });

  return NextResponse.json({ success: true });
}
