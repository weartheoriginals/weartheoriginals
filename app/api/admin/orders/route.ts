import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const supabase = getSupabaseAdmin();

  const { data, error: dbError } = await supabase
    .from('orders')
    .select(
      `id, order_number, full_name, email, status, total_amount, payment_currency, payment_amount,
       created_at, payment_submitted_at, order_items(quantity)`,
    )
    .order('created_at', { ascending: false })
    .limit(500);

  if (dbError) {
    return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
  }

  const orders = (data ?? []).map(o => {
    const { order_items, ...rest } = o as typeof o & { order_items: { quantity: number }[] | null };
    return {
      ...rest,
      item_count: (order_items ?? []).reduce((sum, i) => sum + (i.quantity ?? 0), 0),
    };
  });

  // Newest first, but "payment under review" always on top.
  orders.sort((a, b) => Number(b.status === 'payment_review') - Number(a.status === 'payment_review'));

  return NextResponse.json({ success: true, data: orders });
}
