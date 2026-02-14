"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search, X } from "lucide-react";

interface BookSearchProps {
  categories: string[];
  shelves: { id: number; name: string }[];
  currentParams: {
    q?: string;
    category?: string;
    language?: string;
    shelf?: string;
    sort?: string;
  };
}

function BookSearch({ categories, shelves, currentParams }: BookSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentParams.q ?? "");

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/books?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("q", query);
  }

  function clearFilters() {
    setQuery("");
    router.push("/books");
  }

  const hasFilters =
    currentParams.q ||
    currentParams.category ||
    currentParams.language ||
    currentParams.shelf ||
    currentParams.sort;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kitap veya yazar ara..."
            className="pl-9"
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Select
          options={categories.map((c) => ({ value: c, label: c }))}
          placeholder="Kategori"
          value={currentParams.category ?? ""}
          onChange={(e) => updateParams("category", e.target.value)}
          className="w-auto min-w-[120px]"
        />
        <Select
          options={[
            { value: "Türkçe", label: "Türkçe" },
            { value: "İngilizce", label: "İngilizce" },
          ]}
          placeholder="Dil"
          value={currentParams.language ?? ""}
          onChange={(e) => updateParams("language", e.target.value)}
          className="w-auto min-w-[100px]"
        />
        <Select
          options={shelves.map((s) => ({
            value: String(s.id),
            label: s.name,
          }))}
          placeholder="Raf"
          value={currentParams.shelf ?? ""}
          onChange={(e) => updateParams("shelf", e.target.value)}
          className="w-auto min-w-[120px]"
        />
        <Select
          options={[
            { value: "newest", label: "En yeni" },
            { value: "oldest", label: "En eski" },
            { value: "author", label: "Yazar" },
          ]}
          placeholder="Sırala"
          value={currentParams.sort ?? ""}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="w-auto min-w-[100px]"
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="
              inline-flex items-center gap-1 px-3 py-2
              text-xs font-semibold uppercase tracking-[0.05em]
              text-accent-red border-2 border-accent-red
              hover:bg-accent-red hover:text-paper
              transition-colors duration-150 cursor-pointer
            "
          >
            <X size={12} />
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}

export { BookSearch };
