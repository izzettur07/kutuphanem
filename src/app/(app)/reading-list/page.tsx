import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReadingListTabs } from "./reading-list-tabs";

interface ReadingListPageProps {
  searchParams: Promise<{ tab?: string }>;
}

const tabConfig = [
  { key: "reading", label: "Okuyorum", badge: "blue" as const },
  { key: "to_read", label: "Okuyacağım", badge: "amber" as const },
  { key: "read", label: "Okudum", badge: "green" as const },
  { key: "wishlist", label: "İstek", badge: "purple" as const },
  { key: "dropped", label: "Bıraktım", badge: "red" as const },
];

export default async function ReadingListPage({ searchParams }: ReadingListPageProps) {
  const params = await searchParams;
  const tab = params.tab ?? "reading";
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("*, books(*)")
    .eq("user_id", user?.id ?? "")
    .eq("status", tab as "unread" | "reading" | "read" | "wishlist" | "to_read")
    .order("updated_at", { ascending: false });

  // Count per tab
  const { data: allUserBooks } = await supabase
    .from("user_books")
    .select("status")
    .eq("user_id", user?.id ?? "");

  const counts: Record<string, number> = {};
  for (const t of tabConfig) {
    counts[t.key] = allUserBooks?.filter((b) => b.status === t.key).length ?? 0;
  }

  return (
    <>
      <Header title="Okuma Listesi" />
      <div className="p-4 space-y-4">
        <ReadingListTabs tabs={tabConfig} counts={counts} activeTab={tab} />

        {userBooks && userBooks.length > 0 ? (
          <div className="space-y-3">
            {userBooks.map((ub) => {
              const book = ub.books as unknown as {
                id: number;
                title: string;
                author: string;
                page_count: number | null;
                category: string | null;
              };
              if (!book) return null;

              return (
                <Link key={ub.id} href={`/books/${book.id}`}>
                  <Card className="hover:border-accent-blue transition-colors duration-150 mb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink leading-tight">
                          {book.title}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">{book.author}</p>
                        {book.category && (
                          <Badge variant="blue" className="mt-1">{book.category}</Badge>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {ub.rating && (
                          <span className="text-xs font-semibold text-accent-amber">
                            {"★".repeat(ub.rating)}
                          </span>
                        )}
                        {ub.is_favorite && (
                          <span className="text-xs text-accent-red">♥</span>
                        )}
                        {book.page_count && (
                          <span className="text-[10px] text-ink-muted">
                            {book.page_count} sayfa
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-ink-muted text-center py-8">
              Bu listede henüz kitap yok.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
