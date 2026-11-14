import { requireAdmin } from '@/lib/admin-auth';
import { canMove } from '@/lib/order-status';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

type Ctx = { params: Promise<{ id: string }> };

interface RawItem {
  id: string;
  quantity: number;
  unit_price: number;
  products: {
    name: string;
    slug: string;
    product_images: { image_url: string; is_primary: boolean | null; display_order: number | null }[] | null;
  } | null;
  order_item_variants: { product_variants: { attribute_name: string; attribute_value: string } | null }[] | null;
}

interface RawOrder {
  receipt_path: string | null;
  order_items: RawItem[] | null;
  order_status_history: { status: string; happened_at: string }[] | null;
  [key: string]: unknown;
}

export async function GET(request: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error: dbError } = await supabase
    .from('orders')
    .select(
      `*,
       order_items(
         id, quantity, unit_price,
         products(name, slug, product_images(image_url, is_primary, display_order)),
         order_item_variants(product_variants(attribute_name, attribute_value))
       ),
       order_status_history(status, happened_at)`,
    )
    .eq('id', id)
    .maybeSingle();

  if (dbError) {
    return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  const { order_items, order_status_history, ...order } = data as unknown as RawOrder;

  const items = (order_items ?? []).map(it => {
    const images = [...(it.products?.product_images ?? [])].sort(
      (a, b) => Number(!!b.is_primary) - Number(!!a.is_primary) || (a.display_order ?? 0) - (b.display_order ?? 0),
    );
    return {
      id: it.id,
      name: it.products?.name ?? 'Deleted product',
      slug: it.products?.slug ?? null,
      image: images[0]?.image_url ?? null,
      variants: (it.order_item_variants ?? []).flatMap(v =>
        v.product_variants ? [`${v.product_variants.attribute_name}: ${v.product_variants.attribute_value}`] : [],
      ),
      quantity: it.quantity,
      unit_price: it.unit_price,
    };
  });

  const history = [...(order_status_history ?? [])].sort(
    (a, b) => new Date(a.happened_at).getTime() - new Date(b.happened_at).getTime(),
  );

  let receipt_url: string | null = null;
  if (order.receipt_path) {
    const { data: signed } = await supabase.storage.from('payment-receipts').createSignedUrl(order.receipt_path, 600);
    receipt_url = signed?.signedUrl ?? null;
  }

  return NextResponse.json({ success: true, data: { ...order, items, history, receipt_url } });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
  const next = typeof body.status === 'string' ? body.status : '';

  const supabase = getSupabaseAdmin();

  const { data: current } = await supabase.from('orders').select('status').eq('id', id).maybeSingle();
  if (!current) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  const from = (current.status as string | null) ?? '';
  if (!canMove(from, next)) {
    return NextResponse.json({ success: false, error: `Cannot move from ${from} to ${next}` }, { status: 400 });
  }

  // Only update if the status is still what we just read (stops double clicks / two admins).
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status: next })
    .eq('id', id)
    .eq('status', from)
    .select('id')
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json(
      { success: false, error: 'This order was changed by someone else. Refresh and try again.' },
      { status: 409 },
    );
  }

  const { error: historyError } = await supabase
    .from('order_status_history')
    .upsert({ order_id: id, status: next }, { onConflict: 'order_id,status', ignoreDuplicates: true });
  if (historyError) console.error('order_status_history insert failed:', historyError.message);

  return NextResponse.json({ success: true, data: { id, status: next } });
}
