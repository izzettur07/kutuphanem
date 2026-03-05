import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { SettingsManager } from "./settings-manager";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [
    { data: lookupValues },
    { data: shelves },
    { data: bookCategories },
    { data: bookLanguages },
  ] = await Promise.all([
    supabase.from("lookup_values").select("*").order("value"),
    supabase.from("shelves").select("id, name, position, shelf_count").order("position"),
    supabase.from("books").select("category").not("category", "is", null),
    supabase.from("books").select("language").not("language", "is", null),
  ]);

  const categories = lookupValues?.filter((v) => v.type === "category") ?? [];
  const languages = lookupValues?.filter((v) => v.type === "language") ?? [];

  // Unique categories/languages from books that are NOT yet in lookup_values
  const lookupCatValues = new Set(categories.map((c) => c.value));
  const lookupLangValues = new Set(languages.map((l) => l.value));

  const bookOnlyCategories = [
    ...new Set(
      (bookCategories?.map((b) => b.category).filter(Boolean) as string[] ?? [])
        .filter((c) => !lookupCatValues.has(c))
    ),
  ].sort();

  const bookOnlyLanguages = [
    ...new Set(
      (bookLanguages?.map((b) => b.language).filter(Boolean) as string[] ?? [])
        .filter((l) => !lookupLangValues.has(l))
    ),
  ].sort();

  return (
    <>
      <Header title="Ayarlar" />
      <div className="p-4 max-w-lg">
        <SettingsManager
          categories={categories}
          languages={languages}
          shelves={shelves ?? []}
          bookOnlyCategories={bookOnlyCategories}
          bookOnlyLanguages={bookOnlyLanguages}
        />
      </div>
    </>
  );
}
