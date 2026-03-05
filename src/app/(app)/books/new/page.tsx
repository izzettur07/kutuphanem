import { createClient } from "@/lib/supabase/server";
import { NewBookForm } from "./new-book-form";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const supabase = await createClient();

  const [
    { data: lookupValues },
    { data: shelves },
    { data: bookCategories },
    { data: bookLanguages },
  ] = await Promise.all([
    supabase.from("lookup_values").select("type, value").order("value"),
    supabase.from("shelves").select("id, name").order("position"),
    supabase.from("books").select("category").not("category", "is", null),
    supabase.from("books").select("language").not("language", "is", null),
  ]);

  const lookupCats = lookupValues?.filter((v) => v.type === "category").map((v) => v.value) ?? [];
  const lookupLangs = lookupValues?.filter((v) => v.type === "language").map((v) => v.value) ?? [];

  const categories = [
    ...new Set([
      ...lookupCats,
      ...(bookCategories?.map((b) => b.category).filter(Boolean) as string[] ?? []),
    ]),
  ].sort();

  const languages = [
    ...new Set([
      ...lookupLangs,
      ...(bookLanguages?.map((b) => b.language).filter(Boolean) as string[] ?? []),
    ]),
  ].sort();

  return (
    <NewBookForm
      categories={categories}
      languages={languages.length > 0 ? languages : ["Türkçe", "İngilizce"]}
      shelves={shelves ?? []}
    />
  );
}
