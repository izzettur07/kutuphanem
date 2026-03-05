import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { SettingsManager } from "./settings-manager";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: lookupValues } = await supabase
    .from("lookup_values")
    .select("*")
    .order("value");

  const { data: shelves } = await supabase
    .from("shelves")
    .select("id, name, position, shelf_count")
    .order("position");

  const categories = lookupValues?.filter((v) => v.type === "category") ?? [];
  const languages = lookupValues?.filter((v) => v.type === "language") ?? [];

  return (
    <>
      <Header title="Ayarlar" />
      <div className="p-4 max-w-lg">
        <SettingsManager
          categories={categories}
          languages={languages}
          shelves={shelves ?? []}
        />
      </div>
    </>
  );
}
