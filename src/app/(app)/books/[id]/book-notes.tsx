"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Database } from "@/lib/supabase/types";

type Note = Database["public"]["Tables"]["user_book_notes"]["Row"];

const noteTypeOptions = [
  { value: "general", label: "Genel" },
  { value: "quote", label: "Alıntı" },
  { value: "thought", label: "Düşünce" },
  { value: "summary", label: "Özet" },
];

const noteTypeBadge: Record<string, "default" | "green" | "blue" | "amber" | "purple"> = {
  general: "default",
  quote: "green",
  thought: "blue",
  summary: "purple",
};

interface BookNotesProps {
  bookId: string;
  notes: Note[];
}

function BookNotes({ bookId, notes: initialNotes }: BookNotesProps) {
  const router = useRouter();
  const supabase = createClient();
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  function startEdit(note: Note) {
    setEditingNoteId(note.id);
    setNoteText(note.note_text);
    setPageNumber(note.page_number ? String(note.page_number) : "");
    setNoteType(note.note_type);
  }

  function cancelEdit() {
    setEditingNoteId(null);
    setNoteText("");
    setPageNumber("");
    setNoteType("general");
  }

  async function handleAddOrUpdate() {
    if (!noteText.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    if (editingNoteId) {
      // Update existing note
      const { data, error } = await supabase
        .from("user_book_notes")
        .update({
          note_text: noteText.trim(),
          page_number: pageNumber ? Number(pageNumber) : null,
          note_type: noteType as "general" | "quote" | "thought" | "summary",
        })
        .eq("id", editingNoteId)
        .select()
        .single();

      if (!error && data) {
        setNotes(notes.map((n) => (n.id === editingNoteId ? data : n)));
        cancelEdit();
      }
    } else {
      // Insert new note
      const { data, error } = await supabase
        .from("user_book_notes")
        .insert({
          user_id: user.id,
          book_id: bookId,
          note_text: noteText.trim(),
          page_number: pageNumber ? Number(pageNumber) : null,
          note_type: noteType as "general" | "quote" | "thought" | "summary",
        })
        .select()
        .single();

      if (!error && data) {
        setNotes([data, ...notes]);
        setNoteText("");
        setPageNumber("");
        setNoteType("general");
      }
    }

    setLoading(false);
    router.refresh();
  }

  async function handleDelete(noteId: string) {
    const { error } = await supabase
      .from("user_book_notes")
      .delete()
      .eq("id", noteId);

    if (!error) {
      setNotes(notes.filter((n) => n.id !== noteId));
      if (editingNoteId === noteId) {
        cancelEdit();
      }
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Add / Edit note form */}
      <div className="space-y-3">
        <Textarea
          id="note_text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={editingNoteId ? "Notu düzenle..." : "Not ekle..."}
        />
        <div className="flex gap-2 items-end flex-wrap">
          <Input
            id="page_number"
            label="Sayfa"
            type="number"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            min={1}
            className="w-24"
          />
          <Select
            id="note_type"
            label="Tür"
            options={noteTypeOptions}
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="w-32"
          />
          <Button
            size="sm"
            onClick={handleAddOrUpdate}
            disabled={loading || !noteText.trim()}
          >
            {loading ? "..." : editingNoteId ? "Kaydet" : "Ekle"}
          </Button>
          {editingNoteId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              disabled={loading}
            >
              İptal
            </Button>
          )}
        </div>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          <div className="border-t border-dashed border-ink-muted" />
          {notes.map((note) => (
            <div
              key={note.id}
              className={`flex justify-between items-start gap-3 p-2 -mx-2 transition-colors duration-150 ${
                editingNoteId === note.id ? "bg-paper-alt" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={noteTypeBadge[note.note_type] ?? "default"}>
                    {noteTypeOptions.find((o) => o.value === note.note_type)?.label ?? note.note_type}
                  </Badge>
                  {note.page_number && (
                    <span className="text-[10px] text-ink-muted">
                      s. {note.page_number}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink whitespace-pre-wrap">
                  {note.note_text}
                </p>
                <p className="text-[10px] text-ink-muted mt-1">
                  {new Date(note.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(note)}
                  className="text-ink-muted hover:text-accent-blue transition-colors duration-150 cursor-pointer"
                  title="Düzenle"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-ink-muted hover:text-accent-red transition-colors duration-150 cursor-pointer"
                  title="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted text-center py-4">
          Henüz not eklenmemiş.
        </p>
      )}
    </div>
  );
}

export { BookNotes };
