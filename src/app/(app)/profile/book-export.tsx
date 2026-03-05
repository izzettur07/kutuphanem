"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Download } from "lucide-react";

interface ExportProps {
  username: string;
  fullName: string;
  stats: { read: number; reading: number; total: number };
  readingGoal: string;
}

const STATUS_LABELS: Record<string, string> = {
  read: "Okudum",
  reading: "Okuyorum",
  to_read: "Okuyacağım",
  unread: "Okumadım",
  wishlist: "İstek Listesi",
};

const STATUS_ORDER = ["read", "reading", "to_read", "unread", "wishlist"];

const FORMAT_OPTIONS = [
  { value: "json", label: "JSON" },
  { value: "md", label: "Markdown (.md)" },
];

interface BookWithStatus {
  title: string;
  author: string;
  publisher: string | null;
  category: string | null;
  language: string;
  page_count: number | null;
  isbn: string | null;
  status: string;
  rating: number | null;
  is_favorite: boolean;
  shelf_name: string | null;
  shelf_row: number | null;
}

export function BookExport({ username, fullName, stats, readingGoal }: ExportProps) {
  const supabase = createClient();
  const [format, setFormat] = useState("md");
  const [loading, setLoading] = useState(false);

  async function fetchBooks(): Promise<{ statusBooks: BookWithStatus[]; unassignedBooks: BookWithStatus[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { statusBooks: [], unassignedBooks: [] };

    const { data: userBooks } = await supabase
      .from("user_books")
      .select("book_id, status, rating, is_favorite")
      .eq("user_id", user.id);

    const { data: allBooks } = await supabase
      .from("books")
      .select("id, title, author, publisher, category, language, page_count, isbn, shelf_row, shelves(name)");

    if (!allBooks) return { statusBooks: [], unassignedBooks: [] };

    const statusMap = new Map(
      (userBooks ?? []).map((ub) => [ub.book_id, { status: ub.status, rating: ub.rating, is_favorite: ub.is_favorite }])
    );

    const assignedBookIds = new Set((userBooks ?? []).map((ub) => ub.book_id));

    const statusBooks = allBooks
      .filter((book) => assignedBookIds.has(book.id))
      .map((book) => {
        const info = statusMap.get(book.id);
        return {
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          category: book.category,
          language: book.language,
          page_count: book.page_count,
          isbn: book.isbn,
          status: info?.status ?? "unread",
          rating: info?.rating ?? null,
          is_favorite: info?.is_favorite ?? false,
          shelf_name: book.shelves ? (book.shelves as { name: string }).name : null,
          shelf_row: book.shelf_row ?? null,
        };
      });

    const unassignedBooks = allBooks
      .filter((book) => !assignedBookIds.has(book.id))
      .map((book) => ({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        category: book.category,
        language: book.language,
        page_count: book.page_count,
        isbn: book.isbn,
        status: "none",
        rating: null,
        is_favorite: false,
        shelf_name: book.shelves ? (book.shelves as { name: string }).name : null,
        shelf_row: book.shelf_row ?? null,
      }));

    return { statusBooks, unassignedBooks };
  }

  function groupByStatus(books: BookWithStatus[]): Record<string, BookWithStatus[]> {
    const grouped: Record<string, BookWithStatus[]> = {};
    for (const s of STATUS_ORDER) {
      const filtered = books.filter((b) => b.status === s);
      if (filtered.length > 0) {
        grouped[s] = filtered;
      }
    }
    return grouped;
  }

  function formatBookMd(book: BookWithStatus): string {
    let line = `- **${book.title}** — ${book.author}`;
    const details: string[] = [];
    if (book.publisher) details.push(book.publisher);
    if (book.category) details.push(book.category);
    if (book.page_count) details.push(`${book.page_count} sayfa`);
    if (book.rating) details.push(`${"★".repeat(book.rating)}${"☆".repeat(5 - book.rating)}`);
    if (book.is_favorite) details.push("❤️ Favori");
    if (details.length > 0) {
      line += `\n  - ${details.join(" · ")}`;
    }
    if (book.shelf_name) {
      const locationParts: string[] = [book.shelf_name];
      if (book.shelf_row) locationParts.push(`Raf ${book.shelf_row}`);
      line += `\n  - 📍 Konum: ${locationParts.join(" · ")}`;
    }
    line += `\n`;
    return line;
  }

  function generateMarkdown(statusBooks: BookWithStatus[], unassignedBooks: BookWithStatus[]): string {
    const now = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const exportedBy = fullName || username;
    const grouped = groupByStatus(statusBooks);

    let md = `# Kitap Listem\n\n`;
    md += `**Dışa aktaran:** ${exportedBy}\n`;
    md += `**Tarih:** ${now}\n\n`;
    md += `---\n\n`;

    for (const statusKey of STATUS_ORDER) {
      const group = grouped[statusKey];
      if (!group) continue;

      md += `## ${STATUS_LABELS[statusKey]} (${group.length})\n\n`;
      for (const book of group) {
        md += formatBookMd(book);
      }
      md += `\n`;
    }

    md += `---\n\n`;
    md += `## Okuma Özeti\n\n`;
    md += `| Bilgi | Değer |\n`;
    md += `|-------|-------|\n`;
    md += `| Okunan kitap | ${stats.read} |\n`;
    md += `| Okunan / Hedef | ${stats.read} / ${readingGoal || "—"} |\n`;
    md += `| Şu an okuyor | ${stats.reading} |\n`;
    md += `| Toplam listede | ${stats.total} |\n`;

    if (unassignedBooks.length > 0) {
      md += `\n---\n\n`;
      md += `## Durumu Belirlenmemiş Kitaplar (${unassignedBooks.length})\n\n`;
      for (const book of unassignedBooks) {
        md += formatBookMd(book);
      }
      md += `\n`;
    }

    return md;
  }

  function formatBookJson(book: BookWithStatus) {
    return {
      baslik: book.title,
      yazar: book.author,
      yayinevi: book.publisher,
      kategori: book.category,
      dil: book.language,
      sayfa_sayisi: book.page_count,
      isbn: book.isbn,
      puan: book.rating,
      favori: book.is_favorite,
      dolap: book.shelf_name,
      raf_sirasi: book.shelf_row,
    };
  }

  function generateJSON(statusBooks: BookWithStatus[], unassignedBooks: BookWithStatus[]): string {
    const now = new Date().toISOString();
    const exportedBy = fullName || username;
    const grouped = groupByStatus(statusBooks);

    const data: Record<string, unknown> = {
      meta: {
        exported_by: exportedBy,
        exported_at: now,
      },
      kitaplar: Object.fromEntries(
        STATUS_ORDER
          .filter((s) => grouped[s])
          .map((s) => [
            STATUS_LABELS[s],
            grouped[s].map(formatBookJson),
          ])
      ),
      okuma_ozeti: {
        okunan_kitap: stats.read,
        okunan_hedef: `${stats.read} / ${readingGoal || "—"}`,
        su_an_okuyor: stats.reading,
        toplam_listede: stats.total,
      },
    };

    if (unassignedBooks.length > 0) {
      data.durumu_belirlenmemis_kitaplar = unassignedBooks.map(formatBookJson);
    }

    return JSON.stringify(data, null, 2);
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleExport() {
    setLoading(true);
    try {
      const { statusBooks, unassignedBooks } = await fetchBooks();
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `kitap-listem-${timestamp}`;

      if (format === "md") {
        const content = generateMarkdown(statusBooks, unassignedBooks);
        downloadFile(content, `${fileName}.md`, "text/markdown;charset=utf-8");
      } else {
        const content = generateJSON(statusBooks, unassignedBooks);
        downloadFile(content, `${fileName}.json`, "application/json;charset=utf-8");
      }
    } catch (err) {
      console.error("Export error:", err);
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2 items-end">
      <Select
        id="export-format"
        label="Format"
        options={FORMAT_OPTIONS}
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="w-40"
      />
      <Button size="sm" onClick={handleExport} disabled={loading}>
        <Download size={14} className="mr-1" />
        {loading ? "Hazırlanıyor..." : "Dışa Aktar"}
      </Button>
    </div>
  );
}
