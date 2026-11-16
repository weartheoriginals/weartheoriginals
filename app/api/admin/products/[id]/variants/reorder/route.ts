import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// PUT { attributes: ["Color", "Size"] } — saves the order of attribute groups for one product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const attributes = body?.attributes;

  if (!Array.isArray(attributes) || attributes.some(a => typeof a !== 'string')) {
    return NextResponse.json({ success: false, error: 'attributes must be an array of names' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const results = await Promise.all(
    attributes.map((name: string, index: number) =>
      supabase.from('product_variants').update({ attribute_order: index }).eq('product_id', id).eq('attribute_name', name),
    ),
  );

  const failed = results.find(r => r.error);
  if (failed?.error) {
    return NextResponse.json({ success: false, error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { updated: attributes.length } });
}
