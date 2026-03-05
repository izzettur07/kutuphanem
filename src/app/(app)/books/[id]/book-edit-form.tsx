"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Pencil, X, Check } from "lucide-react";
import { updateBook } from "../actions";

interface BookData {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  isbn: string | null;
  category: string | null;
  language: string;
  shelf_id: string | null;
  shelf_row: number | null;
  page_count: number | null;
  cover_url: string | null;
}

interface Props {
  book: BookData;
  categories: string[];
  languages: string[];
  shelves: { id: string; name: string }[];
}

export function BookEditForm({ book, categories, languages, shelves }: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    publisher: book.publisher ?? "",
    isbn: book.isbn ?? "",
    category: book.category ?? "",
    language: book.language,
    shelf_id: book.shelf_id ?? "",
    shelf_row: book.shelf_row ? String(book.shelf_row) : "",
    page_count: book.page_count ? String(book.page_count) : "",
    cover_url: book.cover_url ?? "",
  });

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!form.title.trim() || !form.author.trim()) return;
    setError("");
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.set(k, v));
      try {
        await updateBook(book.id, fd);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kaydetme hatası.");
      }
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="
          inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase
          tracking-[0.05em] text-ink-muted border border-border px-2 py-1
          hover:bg-ink hover:text-paper transition-colors duration-150
        "
      >
        <Pencil size={11} />
        Düzenle
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-3 border-t-2 border-border pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
        Kitap Bilgilerini Düzenle
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="edit-title"
          label="Başlık"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
        />
        <Input
          id="edit-author"
          label="Yazar"
          value={form.author}
          onChange={(e) => setField("author", e.target.value)}
        />
        <Input
          id="edit-publisher"
          label="Yayınevi"
          value={form.publisher}
          onChange={(e) => setField("publisher", e.target.value)}
        />
        <Input
          id="edit-isbn"
          label="ISBN"
          value={form.isbn}
          onChange={(e) => setField("isbn", e.target.value)}
        />
        <Select
          id="edit-category"
          label="Kategori"
          options={categories.map((c) => ({ value: c, label: c }))}
          placeholder="Seçin"
          value={form.category}
          onChange={(e) => setField("category", e.target.value)}
        />
        <Select
          id="edit-language"
          label="Dil"
          options={languages.map((l) => ({ value: l, label: l }))}
          value={form.language}
          onChange={(e) => setField("language", e.target.value)}
        />
        <Select
          id="edit-shelf"
          label="Raf"
          options={shelves.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="Seçin"
          value={form.shelf_id}
          onChange={(e) => setField("shelf_id", e.target.value)}
        />
        <Input
          id="edit-shelf-row"
          label="Raf Sırası"
          type="number"
          min={1}
          value={form.shelf_row}
          onChange={(e) => setField("shelf_row", e.target.value)}
        />
        <Input
          id="edit-page-count"
          label="Sayfa Sayısı"
          type="number"
          min={1}
          value={form.page_count}
          onChange={(e) => setField("page_count", e.target.value)}
        />
        <Input
          id="edit-cover-url"
          label="Kapak URL"
          value={form.cover_url}
          onChange={(e) => setField("cover_url", e.target.value)}
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-xs text-accent-red">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={pending}>
          <Check size={13} className="mr-1" />
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={pending}>
          <X size={13} className="mr-1" />
          İptal
        </Button>
      </div>
    </div>
  );
}
