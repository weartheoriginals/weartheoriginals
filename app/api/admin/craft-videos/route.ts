import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = getSupabaseAdmin();

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("craft_videos")
    .select("*")
    .order("display_order", { ascending: true });

  if (error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const media_type = body.media_type === "image" ? "image" : "video";

  if (!body.title) {
    return NextResponse.json(
      { success: false, error: "title is required" },
      { status: 400 },
    );
  }
  if (media_type === "video" && !body.video_url) {
    return NextResponse.json(
      { success: false, error: "video_url is required" },
      { status: 400 },
    );
  }
  if (media_type === "image" && !body.image_url) {
    return NextResponse.json(
      { success: false, error: "image_url is required" },
      { status: 400 },
    );
  }

  const { data: last } = await supabaseAdmin
    .from("craft_videos")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabaseAdmin
    .from("craft_videos")
    .insert({
      title: body.title.trim(),
      caption: body.caption?.trim() || null,
      media_type,
      video_url: media_type === "video" ? body.video_url : null,
      image_url: media_type === "image" ? body.image_url : null,
      display_order: (last?.display_order ?? -1) + 1,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  return NextResponse.json({ success: true, data }, { status: 201 });
}
