"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { deleteBook } from "./actions";

interface DeleteBookButtonProps {
  bookId: string;
  bookTitle: string;
}

export function DeleteBookButton({ bookId, bookTitle }: DeleteBookButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBook(bookId);
      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Kitap silinirken bir hata oluştu.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="p-1.5 rounded hover:bg-accent-red/20 text-ink-muted hover:text-accent-red transition-colors"
        title="Kitabı Sil"
      >
        <Trash2 size={14} />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!deleting) setShowConfirm(false);
          }}
        >
          <div
            className="bg-paper border-2 border-border p-6 mx-4 max-w-sm w-full shadow-brutal"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                Kitabı Sil
              </h3>
              <button
                type="button"
                onClick={() => !deleting && setShowConfirm(false)}
                className="p-1 hover:bg-accent-red/10 text-ink-muted hover:text-accent-red transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-ink mb-2">
              <strong>&quot;{bookTitle}&quot;</strong> adlı kitabı silmek istediğinize emin misiniz?
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Bu işlem geri alınamaz. Kitaba ait tüm notlar ve okuma durumu da silinecektir.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => !deleting && setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-border bg-paper text-ink hover:bg-ink/5 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-accent-red bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors disabled:opacity-50"
              >
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
