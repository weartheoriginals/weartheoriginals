import { requireAdmin } from '@/lib/admin-auth';
import { CUSTOM_STATUSES } from '@/lib/custom-request-types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

type Ctx = { params: Promise<{ id: string }> };

interface RawFile {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  uploaded: boolean;
}

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });
const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

export async function GET(request: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error: dbError } = await supabase
    .from('custom_requests')
    .select(
      `*,
       product:products(name, slug),
       custom_request_files(id, file_name, file_path, mime_type, size_bytes, uploaded),
       custom_request_status_history(status, happened_at)`,
    )
    .eq('id', id)
    .maybeSingle();

  if (dbError) {
    console.error('admin custom request load failed:', dbError);
    return fail('Failed to load request', 500);
  }
  if (!data) return fail('Request not found', 404);

  const { product, custom_request_files, custom_request_status_history, ...req } = data as typeof data & {
    product: { name: string; slug: string } | { name: string; slug: string }[] | null;
    custom_request_files: RawFile[] | null;
    custom_request_status_history: { status: string; happened_at: string }[] | null;
  };

  const p = Array.isArray(product) ? product[0] : product;

  const files = await Promise.all(
    (custom_request_files ?? [])
      .filter((f: RawFile) => f.uploaded)
      .map(async (f: RawFile) => {
        const { data: signed } = await supabase.storage.from('custom-request-files').createSignedUrl(f.file_path, 600);
        return {
          id: f.id,
          name: f.file_name,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes,
          url: signed?.signedUrl ?? null,
        };
      }),
  );

  const history = [...(custom_request_status_history ?? [])].sort(
    (a, b) => new Date(a.happened_at).getTime() - new Date(b.happened_at).getTime(),
  );

  return NextResponse.json({
    success: true,
    data: { ...req, product_name: p?.name ?? null, product_slug: p?.slug ?? null, files, history },
  });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return fail('Invalid request');

  const num = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };
  const customization = num(body.quote_customization);
  const shipping = num(body.quote_shipping);
  if (Number.isNaN(customization) || Number.isNaN(shipping)) return fail('Enter valid amounts');

  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase.from('custom_requests').select('status').eq('id', id).maybeSingle();
  if (!current) return fail('Request not found', 404);

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    quote_customization: customization,
    quote_shipping: shipping,
    quote_total: customization === null && shipping === null ? null : (customization ?? 0) + (shipping ?? 0),
    quote_timeline: text(body.quote_timeline, 200),
    quote_notes: text(body.quote_notes, 3000),
    admin_notes: text(body.admin_notes, 3000),
    updated_at: now,
  };

  let statusChanged = false;
  if (typeof body.status === 'string' && body.status !== current.status) {
    if (body.status === 'awaiting_files' || !CUSTOM_STATUSES.some(s => s.value === body.status)) {
      return fail('Invalid status');
    }
    updates.status = body.status;
    statusChanged = true;
    if (body.status === 'quoted') updates.quoted_at = now;
  }

  const { error: updateError } = await supabase.from('custom_requests').update(updates).eq('id', id);
  if (updateError) {
    console.error('admin custom request update failed:', updateError);
    return fail('Could not save. Please try again.', 500);
  }

  if (statusChanged) {
    const { error: historyError } = await supabase
      .from('custom_request_status_history')
      .insert({ request_id: id, status: updates.status });
    if (historyError) console.error('custom request history insert failed:', historyError);
  }

  return NextResponse.json({ success: true });
}
