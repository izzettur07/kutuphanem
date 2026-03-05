"use client";

import { useState, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Search, ScanBarcode } from "lucide-react";

const BarcodeScanner = lazy(() =>
  import("./barcode-scanner").then((m) => ({ default: m.BarcodeScanner }))
);

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
  const [warning, setWarning] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanInfo, setScanInfo] = useState("");

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

  // Use ref to avoid stale closure issues
  const formRef = useRef(form);
  formRef.current = form;

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function lookupISBN(isbnParam?: string) {
    const isbnToSearch = isbnParam || formRef.current.isbn;
    if (!isbnToSearch) return;
    setIsbnLoading(true);
    setError("");
    setWarning("");
    setScanInfo("");

    try {
      // Fetch from Google Books API
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnToSearch}`
      );
      const data = await res.json();
      const info = data.items?.[0]?.volumeInfo;

      if (!info) {
        if (isbnParam) {
          // Coming from barcode scanner
          setError(`Barkod okundu: ${isbnToSearch} — Ancak bu ISBN için kitap bilgisi bulunamadı.`);
        } else {
          setError(`ISBN ${isbnToSearch} için kitap bilgisi bulunamadı.`);
        }
        setIsbnLoading(false);
        return;
      }

      // Try to get best quality cover from Google Books
      const googleCover =
        info.imageLinks?.extraLarge ||
        info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.small ||
        info.imageLinks?.thumbnail ||
        "";

      const googleCoverHttps = googleCover
        ? googleCover.replace("http:", "https:")
        : "";

      // Also try Open Library cover (direct image URL, no CORS HEAD check needed)
      const olCoverUrl = `https://covers.openlibrary.org/b/isbn/${isbnToSearch}-L.jpg`;

      // Use Open Library first, Google as fallback
      // We'll set Open Library URL and let the img onError handle fallback
      let bestCover = "";
      if (googleCoverHttps) {
        bestCover = googleCoverHttps;
      }
      // Prefer Open Library if available (direct URL, will test with img tag)
      const olTestUrl = `https://covers.openlibrary.org/b/isbn/${isbnToSearch}-M.jpg`;
      bestCover = bestCover || olTestUrl;

      const coverFound = !!bestCover;

      setForm((prev) => ({
        ...prev,
        isbn: isbnToSearch,
        title: info.title || prev.title,
        author: info.authors?.join(", ") || prev.author,
        publisher: info.publisher || prev.publisher,
        page_count: info.pageCount ? String(info.pageCount) : prev.page_count,
        cover_url: bestCover || prev.cover_url,
        language:
          info.language === "tr"
            ? "Türkçe"
            : info.language === "en"
              ? "İngilizce"
              : prev.language,
      }));

      if (!coverFound) {
        setWarning("Kitap bilgileri bulundu ancak kapak resmi bulunamadı.");
      }

      if (isbnParam) {
        setScanInfo(`Barkod okundu: ${isbnToSearch} — Kitap bilgileri getirildi.`);
      }
    } catch {
      setError("ISBN arama hatası. Lütfen tekrar deneyin.");
    }

    setIsbnLoading(false);
  }

  function handleBarcodeDetected(code: string) {
    setForm((prev) => ({ ...prev, isbn: code }));
    setScannerOpen(false);
    setScanInfo(`Barkod okundu: ${code} — Aranıyor...`);
    lookupISBN(code);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setWarning("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        status: form.status as
          | "unread"
          | "reading"
          | "read"
          | "wishlist"
          | "to_read",
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
                onClick={() => lookupISBN()}
                disabled={isbnLoading || !form.isbn}
              >
                <Search size={14} className="mr-1" />
                {isbnLoading ? "..." : "Ara"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setScannerOpen(!scannerOpen)}
              >
                <ScanBarcode size={14} className="mr-1" />
                Tara
              </Button>
            </div>

            {/* Scan info */}
            {scanInfo && (
              <p className="text-xs text-accent-blue">{scanInfo}</p>
            )}

            {/* Barcode scanner */}
            {scannerOpen && (
              <Suspense
                fallback={
                  <div className="border-2 border-border p-4 text-center text-xs text-ink-muted">
                    Kamera yükleniyor...
                  </div>
                }
              >
                <BarcodeScanner
                  onDetected={handleBarcodeDetected}
                  onClose={() => setScannerOpen(false)}
                />
              </Suspense>
            )}

            {/* Cover preview */}
            {form.cover_url && (
              <div className="flex items-center gap-3">
                <img
                  src={form.cover_url}
                  alt="Kapak önizleme"
                  className="w-16 h-24 object-cover border-2 border-border"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    setWarning("Kapak resmi yüklenemedi.");
                  }}
                />
                <span className="text-[10px] text-ink-muted">Kapak önizleme</span>
              </div>
            )}

            {/* Warning */}
            {warning && (
              <p className="text-xs text-accent-amber">{warning}</p>
            )}

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

            {/* Error */}
            {error && <p className="text-xs text-accent-red">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
