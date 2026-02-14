import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookStatusForm } from "./book-status-form";
import { BookNotes } from "./book-notes";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: book } = await supabase
    .from("books")
    .select("*, shelves(name)")
    .eq("id", Number(id))
    .single();

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

  return (
    <>
      <Header title={book.title} />
      <div className="p-4 space-y-4 max-w-2xl">
        {/* Book info */}
        <Card>
          <div className="flex gap-4">
            {book.cover_image_url && (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-24 h-36 object-cover border-2 border-ink dark:border-paper flex-shrink-0"
              />
            )}
            <div className="flex flex-col gap-2 min-w-0">
              <h2 className="text-base font-semibold text-ink dark:text-paper leading-tight">
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
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-ink-muted">
                {book.page_count && <span>{book.page_count} sayfa</span>}
                {book.shelves && (
                  <span>
                    {(book.shelves as { name: string }).name}
                    {book.shelf_row ? ` · Raf ${book.shelf_row}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* User reading status */}
        <Card>
          <CardHeader>
            <CardTitle>Okuma Durumum</CardTitle>
          </CardHeader>
          <BookStatusForm bookId={book.id} userBook={userBook} />
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notlarım</CardTitle>
          </CardHeader>
          <BookNotes bookId={book.id} notes={notes ?? []} />
        </Card>
      </div>
    </>
  );
}
