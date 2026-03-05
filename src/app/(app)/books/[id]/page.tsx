import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookStatusForm } from "./book-status-form";
import { BookNotes } from "./book-notes";
import { BookEditForm } from "./book-edit-form";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: book },
    { data: lookupValues },
    { data: shelves },
    { data: bookCategories },
    { data: bookLanguages },
  ] = await Promise.all([
    supabase.from("books").select("*, shelves(id, name)").eq("id", id).single(),
    supabase.from("lookup_values").select("type, value").order("value"),
    supabase.from("shelves").select("id, name").order("position"),
    supabase.from("books").select("category").not("category", "is", null),
    supabase.from("books").select("language").not("language", "is", null),
  ]);

  if (!book) notFound();

  const { data: userBook } = await supabase
    .from("user_books")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("book_id", book.id)
    .maybeSingle();

  const { data: notes } = await supabase
    .from("user_book_notes")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("book_id", book.id)
    .order("created_at", { ascending: false });

  const lookupCats =
    lookupValues?.filter((v) => v.type === "category").map((v) => v.value) ?? [];
  const lookupLangs =
    lookupValues?.filter((v) => v.type === "language").map((v) => v.value) ?? [];

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

  const shelfName = book.shelves ? (book.shelves as { name: string }).name : null;

  return (
    <>
      <Header title={book.title} />
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left column: Book info + Status */}
          <div className="space-y-4 lg:w-1/2 xl:w-2/5 flex-shrink-0">
            {/* Book info */}
            <Card>
              <div className="flex gap-4">
                {book.cover_url && (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-24 h-36 object-cover border-2 border-border flex-shrink-0"
                  />
                )}
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-ink leading-tight">
                    {book.title}
                  </h2>
                  <p className="text-sm text-ink-muted">{book.author}</p>
                  {book.publisher && (
                    <p className="text-xs text-ink-muted">{book.publisher}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.category && <Badge variant="blue">{book.category}</Badge>}
                    {book.language && book.language !== "Türkçe" && (
                      <Badge variant="purple">{book.language}</Badge>
                    )}
                    {book.isbn && <Badge>{book.isbn}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-ink-muted">
                    {book.page_count && <span>{book.page_count} sayfa</span>}
                    {shelfName && (
                      <span>
                        {shelfName}
                        {book.shelf_row ? ` · Raf ${book.shelf_row}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline edit form */}
              <BookEditForm
                book={book}
                categories={categories}
                languages={languages.length > 0 ? languages : ["Türkçe", "İngilizce"]}
                shelves={shelves ?? []}
              />
            </Card>

            {/* User reading status */}
            <Card>
              <CardHeader>
                <CardTitle>Okuma Durumum</CardTitle>
              </CardHeader>
              <BookStatusForm bookId={book.id} userBook={userBook} />
            </Card>
          </div>

          {/* Right column: Notes */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle>Notlarım</CardTitle>
              </CardHeader>
              <BookNotes bookId={book.id} notes={notes ?? []} />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
