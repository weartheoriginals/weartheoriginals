import MaterialsReveal from "@/components/materials-reveal";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: media } = await supabaseAdmin
    .from("craft_videos")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <section className="border-b border-espresso/10 py-16 md:py-24 text-center px-6">
        <p className="font-mono-label text-[11px] uppercase text-brass mb-4">
          Materials
        </p>
        <h1 className="font-display font-light text-4xl md:text-5xl text-espresso max-w-2xl mx-auto leading-tight">
          THE FOUNDATION OF EVERY ORIGINAL
        </h1>
      </section>

      {(media ?? []).map((item, i) => (
        <MaterialsReveal
          key={item.id}
          item={item}
          reverse={i % 2 === 1}
          index={i}
        />
      ))}
    </div>
  );
}
