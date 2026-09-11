import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = getSupabaseAdmin();

interface TrackOrderInput {
  order_number: string;
  email: string;
}

export async function POST(request: NextRequest) {
  const body: TrackOrderInput = await request.json();

  const orderNumber = body.order_number?.trim().toUpperCase();
  const email = body.email?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json(
      { success: false, error: "order_number and email are required" },
      { status: 400 },
    );
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      total_amount,
      shipping_address,
      created_at,
      order_items (
        id,
        quantity,
        unit_price,
        products ( name, slug ),
        order_item_variants (
          product_variants ( attribute_name, attribute_value )
        )
      ),
      order_status_history ( status, happened_at )
    `,
    )
    .eq("order_number", orderNumber)
    .ilike("email", email)
    .single();

  // PGRST116 = no rows — same generic message either way, don't leak which part failed
  if (orderError || !order) {
    return NextResponse.json(
      {
        success: false,
        error: "No order found matching that order number and email",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: order });
}
