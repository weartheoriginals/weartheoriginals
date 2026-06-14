import { getSupabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  const { data, error } = await supabaseAdmin.from('categories').select('*').order('display_order', { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}
