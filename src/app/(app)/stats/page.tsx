import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatsCharts } from "./stats-charts";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // All books
  const { data: books } = await supabase.from("books").select("*");

  // User's books
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("*, books(category, language, author, page_count)")
    .eq("user_id", user?.id ?? "");

  const totalBooks = books?.length ?? 0;
  const readBooks = userBooks?.filter((b) => b.status === "read") ?? [];
  const totalRead = readBooks.length;
  const totalPages = readBooks.reduce((sum, b) => {
    const book = b.books as unknown as { page_count: number | null };
    return sum + (book?.page_count ?? 0);
  }, 0);
  const avgRating =
    readBooks.filter((b) => b.rating).length > 0
      ? (
          readBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) /
          readBooks.filter((b) => b.rating).length
        ).toFixed(1)
      : "—";

  // Category distribution
  const categoryMap: Record<string, number> = {};
  books?.forEach((b) => {
    const cat = b.category ?? "Diğer";
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Language distribution
  const languageMap: Record<string, number> = {};
  books?.forEach((b) => {
    const lang = b.language ?? "Bilinmiyor";
    languageMap[lang] = (languageMap[lang] ?? 0) + 1;
  });
  const languageData = Object.entries(languageMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Top authors
  const authorMap: Record<string, number> = {};
  books?.forEach((b) => {
    authorMap[b.author] = (authorMap[b.author] ?? 0) + 1;
  });
  const topAuthors = Object.entries(authorMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Rating distribution
  const ratingMap: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  userBooks?.forEach((b) => {
    if (b.rating) ratingMap[String(b.rating)] = (ratingMap[String(b.rating)] ?? 0) + 1;
  });
  const ratingData = Object.entries(ratingMap).map(([name, value]) => ({
    name: `${name}★`,
    value,
  }));

  return (
    <>
      <Header title="İstatistikler" />
      <div className="p-4 space-y-4 max-w-4xl">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam Kitap", value: totalBooks },
            { label: "Okunan", value: totalRead },
            { label: "Toplam Sayfa", value: totalPages },
            { label: "Ort. Puan", value: avgRating },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-2xl font-semibold text-ink dark:text-paper">{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                {s.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <StatsCharts
          categoryData={categoryData}
          languageData={languageData}
          topAuthors={topAuthors}
          ratingData={ratingData}
        />
      </div>
    </>
  );
}
