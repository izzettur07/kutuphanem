"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Trash2 } from "lucide-react";
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

  async function handleAdd() {
    if (!noteText.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <div className="space-y-3">
        <Textarea
          id="note_text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Not ekle..."
        />
        <div className="flex gap-2 items-end">
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
            onClick={handleAdd}
            disabled={loading || !noteText.trim()}
          >
            {loading ? "..." : "Ekle"}
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          <div className="border-t border-dashed border-ink-muted" />
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex justify-between items-start gap-3"
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
              <button
                onClick={() => handleDelete(note.id)}
                className="text-ink-muted hover:text-accent-red transition-colors duration-150 cursor-pointer flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
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
