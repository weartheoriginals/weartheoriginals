import { getSupabaseAdmin } from "@/lib/supabase";
import HeroContent from "./hero-content";

export default async function Hero() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: banner } = await supabaseAdmin
    .from("site_banner")
    .select("image_url")
    .maybeSingle();
  const imageUrl =
    banner?.image_url ??
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=2000&auto=format&fit=crop";

  return <HeroContent imageUrl={imageUrl} />;
}
