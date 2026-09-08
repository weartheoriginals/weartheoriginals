import { getSupabaseAdmin } from '@/lib/supabase';
import type { CreateOrderInput } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(request: NextRequest) {
  const body: CreateOrderInput = await request.json();

  if (!body.full_name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ success: false, error: 'full_name and email are required' }, { status: 400 });
  }
  if (
    !body.shipping_address?.line1 ||
    !body.shipping_address?.city ||
    !body.shipping_address?.postal_code ||
    !body.shipping_address?.country
  ) {
    return NextResponse.json({ success: false, error: 'Incomplete shipping address' }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
  }
  for (const item of body.items) {
    if (!item.product_id || !item.quantity || item.quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Each item needs a valid product_id and quantity' },
        { status: 400 },
      );
    }
  }

  const productIds = [...new Set(body.items.map(i => i.product_id))];
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, price, is_active')
    .in('id', productIds);

  if (productsError) {
    return NextResponse.json({ success: false, error: productsError.message }, { status: 500 });
  }

  const productMap = new Map((products ?? []).map(p => [p.id, p]));
  for (const item of body.items) {
    const product = productMap.get(item.product_id);
    if (!product || !product.is_active) {
      return NextResponse.json({ success: false, error: `Product ${item.product_id} is unavailable` }, { status: 400 });
    }
  }

  const total_amount = body.items.reduce((sum, item) => {
    const product = productMap.get(item.product_id)!;
    return sum + product.price * item.quantity;
  }, 0);

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      full_name: body.full_name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      shipping_address: body.shipping_address,
      status: 'pending',
      total_amount,
      notes: body.notes?.trim() || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: orderError?.message ?? 'Failed to create order' }, { status: 500 });
  }

  const orderItemsPayload = body.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: productMap.get(item.product_id)!.price,
  }));

  const { data: insertedItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItemsPayload)
    .select('id');

  if (itemsError || !insertedItems) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return NextResponse.json(
      { success: false, error: itemsError?.message ?? 'Failed to create order items' },
      { status: 500 },
    );
  }

  const variantRows = body.items.flatMap((item, index) =>
    (item.variant_ids ?? []).map(variant_id => ({
      order_item_id: insertedItems[index].id,
      variant_id,
    })),
  );

  if (variantRows.length > 0) {
    const { error: variantsError } = await supabaseAdmin.from('order_item_variants').insert(variantRows);
    if (variantsError) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ success: false, error: variantsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, data: order }, { status: 201 });
}
