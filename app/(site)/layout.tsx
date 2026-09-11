import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getSupabasePublic } from "@/lib/supabase";

async function getNavCategories() {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .is("parent_id", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load nav categories:", error);
    return [];
  }
  return data ?? [];
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getNavCategories();

  return (
    <>
      <SiteHeader categories={categories} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
