import { FREE_SHIPPING_THRESHOLD_USD, PAYMENT_CURRENCIES, SHIPPING_FLAT_USD, convertFromUSD } from '@/lib/payment-config';
import { getFinalPrice } from '@/lib/product-ui';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { CreateOrderInput } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

const round2 = (n: number) => Math.round(n * 100) / 100;

const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

async function deleteOrder(orderId: string) {
  // order_items, order_item_variants and history cascade
  await supabaseAdmin.from('orders').delete().eq('id', orderId);
}

export async function POST(request: NextRequest) {
  let body: CreateOrderInput;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request');
  }

  if (!body.full_name?.trim() || !body.email?.trim()) {
    return fail('full_name and email are required');
  }
  if (
    !body.shipping_address?.line1 ||
    !body.shipping_address?.city ||
    !body.shipping_address?.postal_code ||
    !body.shipping_address?.country
  ) {
    return fail('Incomplete shipping address');
  }
  if (!Object.keys(PAYMENT_CURRENCIES).includes(body.payment_currency)) {
    return fail('Unsupported payment currency');
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return fail('Order must contain at least one item');
  }
  for (const item of body.items) {
    if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      return fail('Each item needs a valid product_id and quantity');
    }
  }

  // Products
  const productIds = [...new Set(body.items.map(i => i.product_id))];
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, price, is_active, is_in_stock, discount_percent')
    .in('id', productIds);

  if (productsError) return fail(productsError.message, 500);

  const productMap = new Map((products ?? []).map(p => [p.id, p]));
  for (const item of body.items) {
    const product = productMap.get(item.product_id);
    if (!product || !product.is_active || !product.is_in_stock) {
      return fail(`Product ${item.product_id} is unavailable`);
    }
  }

  // Variants
  const { data: allVariants, error: variantsFetchError } = await supabaseAdmin
    .from('product_variants')
    .select('id, product_id, attribute_name')
    .in('product_id', productIds);

  if (variantsFetchError) return fail(variantsFetchError.message, 500);

  for (const item of body.items) {
    const productVariants = (allVariants ?? []).filter(v => v.product_id === item.product_id);
    const chosenIds = item.variant_ids ?? [];

    if (new Set(chosenIds).size !== chosenIds.length) {
      return fail('Invalid variant selection');
    }

    const chosen = chosenIds.map(id => productVariants.find(v => v.id === id));
    if (chosen.some(v => !v)) {
      return fail('Invalid variant selection');
    }

    // Exactly one value per attribute
    const chosenNames = chosen.map(v => v!.attribute_name);
    const requiredNames = new Set(productVariants.map(v => v.attribute_name));
    if (new Set(chosenNames).size !== chosenNames.length || chosenNames.length !== requiredNames.size) {
      return fail('Please select every option for each item');
    }
  }

  // Prices, shipping and currency, all on the server
  const itemPrices = body.items.map(item => {
    const product = productMap.get(item.product_id)!;
    return round2(getFinalPrice(Number(product.price), Number(product.discount_percent) || 0));
  });

  const subtotal = round2(body.items.reduce((sum, item, i) => sum + itemPrices[i] * item.quantity, 0));
  const shipping_amount = subtotal >= FREE_SHIPPING_THRESHOLD_USD ? 0 : SHIPPING_FLAT_USD;
  const total_amount = round2(subtotal + shipping_amount);

  const payment_currency = body.payment_currency;
  const exchange_rate = PAYMENT_CURRENCIES[payment_currency].rateFromUSD;
  const payment_amount = convertFromUSD(total_amount, payment_currency);

  // Order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      full_name: body.full_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      shipping_address: body.shipping_address,
      status: 'awaiting_payment',
      total_amount,
      shipping_amount,
      payment_currency,
      payment_amount,
      exchange_rate,
      notes: body.notes?.trim() || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    return fail(orderError?.message ?? 'Failed to create order', 500);
  }

  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert({ order_id: order.id, status: 'awaiting_payment' });

  if (historyError) {
    await deleteOrder(order.id);
    return fail(historyError.message, 500);
  }

  const { data: insertedItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(
      body.items.map((item, i) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: itemPrices[i],
      })),
    )
    .select('id');

  if (itemsError || !insertedItems) {
    await deleteOrder(order.id);
    return fail(itemsError?.message ?? 'Failed to create order items', 500);
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
      await deleteOrder(order.id);
      return fail(variantsError.message, 500);
    }
  }

  return NextResponse.json({ success: true, data: order }, { status: 201 });
}
