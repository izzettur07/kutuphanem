"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { upsertUserBook, removeUserBook } from "../actions";
import { Star, Heart, Trash2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type UserBook = Database["public"]["Tables"]["user_books"]["Row"];

interface BookStatusFormProps {
  bookId: string;
  userBook: UserBook | null;
}

const statusOptions = [
  { value: "unread", label: "Okunmadı" },
  { value: "reading", label: "Okuyorum" },
  { value: "read", label: "Okudum" },
  { value: "to_read", label: "Okuyacağım" },
  { value: "wishlist", label: "İstek Listesi" },
];

function BookStatusForm({ bookId, userBook }: BookStatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(userBook?.status ?? "unread");
  const [rating, setRating] = useState(userBook?.rating ?? 0);
  const [isFavorite, setIsFavorite] = useState(userBook?.is_favorite ?? false);

  async function handleSave() {
    setLoading(true);
    try {
      await upsertUserBook(bookId, {
        status,
        rating: rating || null,
        is_favorite: isFavorite,
      });
      router.refresh();
    } catch {
      // handled by server action
    }
    setLoading(false);
  }

  async function handleRemove() {
    setLoading(true);
    try {
      await removeUserBook(bookId);
      setStatus("unread");
      setRating(0);
      setIsFavorite(false);
      router.refresh();
    } catch {
      // handled by server action
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <Select
        id="status"
        label="Durum"
        options={statusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value as UserBook["status"])}
      />

      {/* Rating */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-ink">
          Puan
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n === rating ? 0 : n)}
              className="cursor-pointer p-0.5"
            >
              <Star
                size={20}
                className={
                  n <= rating
                    ? "fill-accent-amber text-accent-amber"
                    : "text-ink-muted"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Favorite */}
      <button
        type="button"
        onClick={() => setIsFavorite(!isFavorite)}
        className="
          inline-flex items-center gap-2 cursor-pointer
          text-xs font-semibold uppercase tracking-[0.05em]
          text-ink
        "
      >
        <Heart
          size={16}
          className={
            isFavorite
              ? "fill-accent-red text-accent-red"
              : "text-ink-muted"
          }
        />
        {isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      </button>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        {userBook && (
          <Button variant="danger" onClick={handleRemove} disabled={loading}>
            <Trash2 size={14} className="mr-1" />
            Kaldır
          </Button>
        )}
      </div>
    </div>
  );
}

export { BookStatusForm };
