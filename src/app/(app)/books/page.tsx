import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus } from "lucide-react";
import { BookSearch } from "./book-search";

interface BooksPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    language?: string;
    shelf?: string;
    sort?: string;
  }>;
}

function getStatusColor(status: string | null | undefined) {
  switch (status) {
    case "read":
      return "bg-accent-green/10 border-accent-green/40";
    case "reading":
      return "bg-accent-blue/10 border-accent-blue/40";
    case "to_read":
    case "wishlist":
      return "bg-accent-amber/10 border-accent-amber/40";
    default:
      return "bg-accent-red/10 border-accent-red/40";
  }
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("books")
    .select("*, shelves(name)");

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,author.ilike.%${params.q}%`
    );
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.language) {
    query = query.eq("language", params.language);
  }
  if (params.shelf) {
    query = query.eq("shelf_id", params.shelf);
  }

  switch (params.sort) {
    case "author":
      query = query.order("author");
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: books } = await query;

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("book_id, status")
    .eq("user_id", user?.id ?? "");

  const statusMap = new Map(
    userBooks?.map((ub) => [ub.book_id, ub.status]) ?? []
  );

  const { data: lookupValues } = await supabase
    .from("lookup_values")
    .select("type, value")
    .order("value");

  const lookupCategories = lookupValues
    ?.filter((v) => v.type === "category")
    .map((v) => v.value) ?? [];

  const lookupLanguages = lookupValues
    ?.filter((v) => v.type === "language")
    .map((v) => v.value) ?? [];

  // Also include categories from books that aren't in lookup_values
  const { data: bookCategories } = await supabase
    .from("books")
    .select("category")
    .not("category", "is", null);

  const allCategories = [
    ...new Set([
      ...lookupCategories,
      ...(bookCategories?.map((c) => c.category).filter(Boolean) as string[] ?? []),
    ]),
  ].sort();

  const allLanguages = lookupLanguages.length > 0
    ? lookupLanguages
    : ["Türkçe", "İngilizce"];

  const { data: shelves } = await supabase
    .from("shelves")
    .select("id, name")
    .order("position");

  return (
    <>
      <Header title="Kitaplar">
        <Link href="/books/new">
          <Button size="sm">
            <Plus size={14} className="mr-1" />
            Ekle
          </Button>
        </Link>
      </Header>

      <div className="p-4 space-y-4">
        <BookSearch
          categories={allCategories}
          languages={allLanguages}
          shelves={shelves ?? []}
          currentParams={params}
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.05em] border-2 border-border p-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-accent-green/30 border border-accent-green/60" />
            Okudum
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-accent-blue/30 border border-accent-blue/60" />
            Okuyorum
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-accent-amber/30 border border-accent-amber/60" />
            Okuyacağım
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 bg-accent-red/30 border border-accent-red/60" />
            Okumadım
          </span>
        </div>

        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => {
              const status = statusMap.get(book.id);
              const colorClass = getStatusColor(status);
              return (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <Card className={`h-full transition-opacity duration-150 hover:opacity-80 ${colorClass}`}>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-ink leading-tight">
                        {book.title}
                      </p>
                      <p className="text-xs text-ink-muted">{book.author}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {book.category && (
                          <Badge variant="blue">{book.category}</Badge>
                        )}
                        {book.language && book.language !== "Türkçe" && (
                          <Badge variant="purple">{book.language}</Badge>
                        )}
                      </div>
                      {book.shelves && (
                        <p className="text-[10px] text-ink-muted mt-1">
                          {(book.shelves as { name: string }).name}
                          {book.shelf_row ? ` · Raf ${book.shelf_row}` : ""}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-ink-muted text-center py-8">
              Henüz kitap eklenmemiş.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
