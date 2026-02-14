import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
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

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

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
    query = query.eq("shelf_id", Number(params.shelf));
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

  const { data: categories } = await supabase
    .from("books")
    .select("category")
    .not("category", "is", null);

  const uniqueCategories = [
    ...new Set(categories?.map((c) => c.category).filter(Boolean)),
  ];

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
          categories={uniqueCategories as string[]}
          shelves={shelves ?? []}
          currentParams={params}
        />

        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <Card className="h-full hover:border-accent-blue transition-colors duration-150">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-ink dark:text-paper leading-tight">
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
            ))}
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
