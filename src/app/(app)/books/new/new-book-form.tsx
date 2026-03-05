"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

interface Props {
  categories: string[];
  languages: string[];
  shelves: { id: string; name: string }[];
}

const STATUS_OPTIONS = [
  { value: "", label: "Belirtme" },
  { value: "read", label: "Okudum" },
  { value: "reading", label: "Okuyorum" },
  { value: "to_read", label: "Okuyacağım" },
  { value: "unread", label: "Okumadım" },
];

export function NewBookForm({ categories, languages, shelves }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    isbn: "",
    category: "",
    language: languages[0] ?? "Türkçe",
    shelf_id: "",
    shelf_row: "",
    page_count: "",
    cover_url: "",
    status: "",
  });

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function lookupISBN() {
    if (!form.isbn) return;
    setIsbnLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${form.isbn}`
      );
      const data = await res.json();
      const info = data.items?.[0]?.volumeInfo;

      if (!info) {
        setError("ISBN bulunamadı.");
        setIsbnLoading(false);
        return;
      }

      setForm((prev) => ({
        ...prev,
        title: info.title || prev.title,
        author: info.authors?.join(", ") || prev.author,
        publisher: info.publisher || prev.publisher,
        page_count: info.pageCount ? String(info.pageCount) : prev.page_count,
        cover_url:
          info.imageLinks?.thumbnail?.replace("http:", "https:") ||
          prev.cover_url,
        language:
          info.language === "tr"
            ? "Türkçe"
            : info.language === "en"
              ? "İngilizce"
              : prev.language,
      }));
    } catch {
      setError("ISBN arama hatası.");
    }

    setIsbnLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Oturum açmanız gerekiyor.");
      setLoading(false);
      return;
    }

    const { data: newBook, error: insertError } = await supabase
      .from("books")
      .insert({
        title: form.title,
        author: form.author,
        publisher: form.publisher || null,
        isbn: form.isbn || null,
        category: form.category || null,
        language: form.language || "Türkçe",
        shelf_id: form.shelf_id || null,
        shelf_row: form.shelf_row ? Number(form.shelf_row) : null,
        page_count: form.page_count ? Number(form.page_count) : null,
        cover_url: form.cover_url || null,
        added_by: user.id,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Insert reading status if selected
    if (form.status && newBook) {
      await supabase.from("user_books").insert({
        user_id: user.id,
        book_id: newBook.id,
        status: form.status as "unread" | "reading" | "read" | "wishlist" | "to_read",
      });
    }

    router.push("/books");
    router.refresh();
  }

  return (
    <>
      <Header title="Kitap Ekle" />
      <div className="p-4 max-w-lg">
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ISBN lookup */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  id="isbn"
                  label="ISBN"
                  value={form.isbn}
                  onChange={(e) => setField("isbn", e.target.value)}
                  placeholder="978-..."
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={lookupISBN}
                disabled={isbnLoading || !form.isbn}
              >
                <Search size={14} className="mr-1" />
                {isbnLoading ? "..." : "Ara"}
              </Button>
            </div>

            <div className="border-t border-dashed border-ink-muted" />

            <Input
              id="title"
              label="Başlık"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
            <Input
              id="author"
              label="Yazar"
              value={form.author}
              onChange={(e) => setField("author", e.target.value)}
              required
            />
            <Input
              id="publisher"
              label="Yayınevi"
              value={form.publisher}
              onChange={(e) => setField("publisher", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="category"
                label="Kategori"
                options={categories.map((c) => ({ value: c, label: c }))}
                placeholder="Seçin"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              />
              <Select
                id="language"
                label="Dil"
                options={languages.map((l) => ({ value: l, label: l }))}
                value={form.language}
                onChange={(e) => setField("language", e.target.value)}
              />
            </div>

            <div className="border-t border-dashed border-ink-muted" />

            <Select
              id="status"
              label="Okuma Durumu"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            />

            <div className="border-t border-dashed border-ink-muted" />

            <div className="grid grid-cols-2 gap-4">
              <Select
                id="shelf_id"
                label="Raf"
                options={shelves.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                placeholder="Seçin"
                value={form.shelf_id}
                onChange={(e) => setField("shelf_id", e.target.value)}
              />
              <Input
                id="shelf_row"
                label="Raf Sırası"
                type="number"
                value={form.shelf_row}
                onChange={(e) => setField("shelf_row", e.target.value)}
                min={1}
              />
            </div>
            <Input
              id="page_count"
              label="Sayfa Sayısı"
              type="number"
              value={form.page_count}
              onChange={(e) => setField("page_count", e.target.value)}
              min={1}
            />
            <Input
              id="cover_url"
              label="Kapak URL"
              value={form.cover_url}
              onChange={(e) => setField("cover_url", e.target.value)}
              placeholder="https://..."
            />

            {error && (
              <p className="text-xs text-accent-red">{error}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
