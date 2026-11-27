import { isCustomType } from '@/lib/custom-request-types';
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
const GENERIC_ERROR = 'Something went wrong. Please try again, or contact us on WhatsApp.';

const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return bad(GENERIC_ERROR);

  const full_name = text(body.full_name, 120);
  const email = text(body.email, 200);
  const phone = text(body.phone, 40);

  if (!full_name || !email || !phone) return bad('Please enter your name, email and phone number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Please enter a valid email address.');
  if (!isCustomType(body.product_type)) return bad("Please choose what you'd like customized.");
  if (body.product_type === 'other' && !text(body.product_type_other, 120)) {
    return bad('Please describe the product.');
  }

  const files: { name: string; type: string; size: number }[] = Array.isArray(body.files) ? body.files : [];

  if (files.length > MAX_FILES) return bad(`You can upload up to ${MAX_FILES} files.`);
  for (const f of files) {
    if (!ALLOWED_TYPES[f.type]) return bad('Only JPG, PNG or PDF files are allowed.');
    if (!Number.isFinite(f.size) || f.size <= 0 || f.size > MAX_FILE_BYTES) {
      return bad('Each file must be under 5 MB.');
    }
  }

  const fieldValues = {
    color: text(body.color, 500),
    material: text(body.material, 500),
    patches: text(body.patches, 1000),
    embroidery: text(body.embroidery, 1000),
    hardware: text(body.hardware, 500),
    measurements: text(body.measurements, 1000),
    other_requests: text(body.other_requests, 3000),
  };
  if (files.length === 0 && !Object.values(fieldValues).some(Boolean)) {
    return bad('Please add at least one detail, a note or a file so we can quote you.');
  }

  let productId: string | null = null;
  if (typeof body.product_id === 'string') {
    const { data: p } = await supabaseAdmin.from('products').select('id').eq('id', body.product_id).maybeSingle();
    productId = p?.id ?? null;
  }

  const initialStatus = files.length > 0 ? 'awaiting_files' : 'submitted';

  const { data: req, error: reqError } = await supabaseAdmin
    .from('custom_requests')
    .insert({
      full_name,
      email: email.toLowerCase(),
      phone,
      product_type: body.product_type,
      product_type_other: body.product_type === 'other' ? text(body.product_type_other, 120) : null,
      product_id: productId,
      ...fieldValues,
      status: initialStatus,
    })
    .select('id, request_number')
    .single();

  if (reqError || !req) {
    console.error('custom request insert failed:', reqError);
    return bad(GENERIC_ERROR, 500);
  }

  const fail = async (reason: unknown) => {
    console.error('custom request upload prep failed:', reason);
    await supabaseAdmin.from('custom_requests').delete().eq('id', req.id);
    return bad(GENERIC_ERROR, 500);
  };

  await supabaseAdmin.from('custom_request_status_history').insert({ request_id: req.id, status: initialStatus });

  const uploads: { fileId: string; path: string; token: string }[] = [];

  for (const f of files) {
    const path = `${req.id}/${crypto.randomUUID()}.${ALLOWED_TYPES[f.type]}`;
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from('custom-request-files')
      .createSignedUploadUrl(path);

    if (signError || !signed) return fail(signError);

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

    if (fileError || !fileRow) return fail(fileError);

    uploads.push({ fileId: fileRow.id, path, token: signed.token });
  }

  return NextResponse.json(
    { success: true, data: { requestId: req.id, requestNumber: req.request_number, uploads } },
    { status: 201 },
  );
}
