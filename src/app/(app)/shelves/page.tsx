import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShelfActions } from "./shelf-actions";
import Link from "next/link";

export default async function ShelvesPage() {
  const supabase = await createClient();

  const { data: shelves } = await supabase
    .from("shelves")
    .select("*")
    .order("position");

  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, shelf_id, shelf_row")
    .not("shelf_id", "is", null)
    .order("shelf_row")
    .order("title");

  // Group books by shelf
  const booksByShelf: Record<number, Record<number, typeof books>> = {};
  books?.forEach((book) => {
    if (!book.shelf_id) return;
    if (!booksByShelf[book.shelf_id]) booksByShelf[book.shelf_id] = {};
    const row = book.shelf_row ?? 1;
    if (!booksByShelf[book.shelf_id][row]) booksByShelf[book.shelf_id][row] = [];
    booksByShelf[book.shelf_id][row]!.push(book);
  });

  return (
    <>
      <Header title="Raflar">
        <ShelfActions />
      </Header>
      <div className="p-4 space-y-6">
        {shelves && shelves.length > 0 ? (
          shelves.map((shelf) => (
            <Card key={shelf.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{shelf.name}</CardTitle>
                  <Badge>{shelf.shelf_count} raf</Badge>
                </div>
              </CardHeader>
              <div className="space-y-3">
                {Array.from({ length: shelf.shelf_count }, (_, i) => i + 1).map(
                  (row) => {
                    const rowBooks = booksByShelf[shelf.id]?.[row] ?? [];
                    return (
                      <div key={row}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted w-12">
                            Raf {row}
                          </span>
                          <div className="flex-1 border-t border-dashed border-ink-muted" />
                        </div>
                        {rowBooks.length > 0 ? (
                          <div className="flex flex-wrap gap-1 ml-14">
                            {rowBooks.map((book) => (
                              <Link key={book.id} href={`/books/${book.id}`}>
                                <span
                                  className="
                                    inline-block px-2 py-1
                                    text-[10px] font-mono
                                    border border-ink text-ink
                                    hover:bg-ink hover:text-paper
                                    transition-colors duration-150
                                    dark:border-paper dark:text-paper
                                    dark:hover:bg-paper dark:hover:text-ink
                                    cursor-pointer
                                  "
                                  title={`${book.title} — ${book.author}`}
                                >
                                  {book.title.length > 25
                                    ? book.title.slice(0, 25) + "…"
                                    : book.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-ink-muted ml-14">Boş</p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-ink-muted text-center py-8">
              Henüz raf eklenmemiş.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
