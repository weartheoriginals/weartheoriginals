import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};
const PRODUCT_TYPES = ['leather_jacket', 'bomber', 'trench_coat', 'bag', 'wallet', 'other'];

const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

export async function POST(request: NextRequest) {
  const body = await request.json();

  const full_name = text(body.full_name, 120);
  const email = text(body.email, 200);
  const phone = text(body.phone, 40);

  if (!full_name || !email || !phone) {
    return NextResponse.json({ success: false, error: 'Name, email and phone are required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
  }
  if (!PRODUCT_TYPES.includes(body.product_type)) {
    return NextResponse.json({ success: false, error: 'Invalid product type' }, { status: 400 });
  }
  if (body.product_type === 'other' && !text(body.product_type_other, 120)) {
    return NextResponse.json({ success: false, error: 'Please describe the product' }, { status: 400 });
  }

  const files: { name: string; type: string; size: number }[] = Array.isArray(body.files) ? body.files : [];

  if (files.length > MAX_FILES) {
    return NextResponse.json({ success: false, error: `Maximum ${MAX_FILES} files` }, { status: 400 });
  }
  for (const f of files) {
    if (!ALLOWED_TYPES[f.type]) {
      return NextResponse.json({ success: false, error: 'Only JPG, PNG or PDF files are allowed' }, { status: 400 });
    }
    if (!Number.isFinite(f.size) || f.size <= 0 || f.size > MAX_FILE_BYTES) {
      return NextResponse.json({ success: false, error: 'Each file must be under 5 MB' }, { status: 400 });
    }
  }

  const { data: req, error: reqError } = await supabaseAdmin
    .from('custom_requests')
    .insert({
      full_name,
      email: email.toLowerCase(),
      phone,
      product_type: body.product_type,
      product_type_other: text(body.product_type_other, 120),
      product_id: typeof body.product_id === 'string' ? body.product_id : null,
      color: text(body.color, 500),
      material: text(body.material, 500),
      patches: text(body.patches, 1000),
      embroidery: text(body.embroidery, 1000),
      hardware: text(body.hardware, 500),
      measurements: text(body.measurements, 1000),
      other_requests: text(body.other_requests, 3000),
      status: files.length > 0 ? 'awaiting_files' : 'submitted',
    })
    .select('id, request_number')
    .single();

  if (reqError || !req) {
    return NextResponse.json({ success: false, error: reqError?.message ?? 'Failed to create request' }, { status: 500 });
  }

  const fail = async (message: string) => {
    await supabaseAdmin.from('custom_requests').delete().eq('id', req.id);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  };

  await supabaseAdmin
    .from('custom_request_status_history')
    .insert({ request_id: req.id, status: files.length > 0 ? 'awaiting_files' : 'submitted' });

  const uploads: { fileId: string; path: string; token: string }[] = [];
  const paths: string[] = [];

  for (const f of files) {
    const path = `${req.id}/${crypto.randomUUID()}.${ALLOWED_TYPES[f.type]}`;
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from('custom-request-files')
      .createSignedUploadUrl(path);

    if (signError || !signed) return fail('Failed to prepare uploads');

    const { data: fileRow, error: fileError } = await supabaseAdmin
      .from('custom_request_files')
      .insert({
        request_id: req.id,
        file_path: path,
        file_name: String(f.name).slice(0, 200),
        mime_type: f.type,
        size_bytes: f.size,
      })
      .select('id')
      .single();

    if (fileError || !fileRow) return fail('Failed to prepare uploads');

    paths.push(path);
    uploads.push({ fileId: fileRow.id, path, token: signed.token });
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        requestId: req.id,
        requestNumber: req.request_number,
        uploads, // browser uploads each file with uploadToSignedUrl(path, token, file)
      },
    },
    { status: 201 },
  );
}
