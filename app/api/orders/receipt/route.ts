import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// Checks the real file bytes, not just the type the browser claims
function matchesType(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === 'application/pdf') return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  return false;
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('Invalid request');
  }

  const orderNumber = String(form.get('order_number') ?? '')
    .trim()
    .toUpperCase();
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  const senderName = String(form.get('sender_name') ?? '').trim();
  const transferDateRaw = String(form.get('transfer_date') ?? '').trim();
  const file = form.get('receipt');

  if (!orderNumber || !email) return fail('order_number and email are required');
  if (!senderName || senderName.length > 120) return fail('Please enter the sender name');
  if (transferDateRaw && !/^\d{4}-\d{2}-\d{2}$/.test(transferDateRaw)) return fail('Invalid transfer date');
  if (!(file instanceof File)) return fail('Please attach your receipt');
  if (file.size === 0 || file.size > MAX_SIZE) return fail('Receipt must be under 4 MB');

  const ext = TYPES[file.type];
  if (!ext) return fail('Receipt must be a JPG, PNG or PDF');

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesType(buffer.subarray(0, 4), file.type)) return fail('Receipt file is not valid');

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('order_number', orderNumber)
    .eq('email', email)
    .maybeSingle();

  if (!order) return fail('No order found matching that order number and email', 404);
  if (order.status !== 'awaiting_payment') return fail('A receipt has already been submitted for this order');

  const path = `${order.id}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from('payment-receipts')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return fail('Upload failed. Please try again.', 500);

  // Only moves forward if the order is still awaiting payment
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'payment_review',
      receipt_path: path,
      sender_name: senderName,
      transfer_date: transferDateRaw || null,
      payment_submitted_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .eq('status', 'awaiting_payment')
    .select('id')
    .maybeSingle();

  if (updateError || !updated) {
    await supabaseAdmin.storage.from('payment-receipts').remove([path]);
    return fail('Could not save your receipt. Please try again.', 500);
  }

  await supabaseAdmin.from('order_status_history').insert({ order_id: order.id, status: 'payment_review' });

  return NextResponse.json({ success: true });
}
