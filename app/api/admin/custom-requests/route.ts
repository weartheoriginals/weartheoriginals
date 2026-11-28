import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { data, error: dbError } = await getSupabaseAdmin()
    .from('custom_requests')
    .select(
      'id, request_number, full_name, email, phone, product_type, product_type_other, status, quote_total, created_at, product:products(name)',
    )
    .order('created_at', { ascending: false })
    .limit(500);

  if (dbError) {
    console.error('admin custom requests list failed:', dbError);
    return NextResponse.json({ success: false, error: 'Failed to load requests' }, { status: 500 });
  }

  const rows = (data ?? []).map(r => {
    const p = Array.isArray(r.product) ? r.product[0] : r.product;
    const { product, ...rest } = r;
    void product;
    return { ...rest, product_name: p?.name ?? null };
  });

  return NextResponse.json({ success: true, data: rows });
}
