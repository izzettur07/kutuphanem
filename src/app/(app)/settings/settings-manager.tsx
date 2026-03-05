"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, X, Pencil, Check } from "lucide-react";
import {
  addLookupValue,
  deleteLookupValue,
  addShelf,
  deleteShelf,
  updateShelf,
} from "./settings-actions";

interface LookupValue {
  id: number;
  type: "category" | "language";
  value: string;
}

interface Shelf {
  id: string;
  name: string;
  position: number;
  shelf_count: number;
}

interface Props {
  categories: LookupValue[];
  languages: LookupValue[];
  shelves: Shelf[];
}

function LookupSection({
  title,
  type,
  items,
}: {
  title: string;
  type: "category" | "language";
  items: LookupValue[];
}) {
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!newValue.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await addLookupValue(type, newValue.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setNewValue("");
      }
    });
  }

  function handleDelete(id: number) {
    setError("");
    startTransition(async () => {
      const result = await deleteLookupValue(id);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {/* Add form */}
        <div className="flex gap-2">
          <Input
            id={`add-${type}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Yeni ${type === "category" ? "kategori" : "dil"} adı...`}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} disabled={pending || !newValue.trim()}>
            <Plus size={14} />
          </Button>
        </div>

        {error && (
          <p className="text-xs text-accent-red">{error}</p>
        )}

        {/* List */}
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 border-2 border-border px-2 py-1"
              >
                <span className="text-xs font-semibold text-ink">{item.value}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={pending}
                  className="text-ink-muted hover:text-accent-red transition-colors duration-150"
                  title="Kaldır"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">Henüz eklenmemiş.</p>
        )}
      </div>
    </Card>
  );
}

function ShelvesSection({ shelves }: { shelves: Shelf[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [shelfCount, setShelfCount] = useState("5");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCount, setEditCount] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim() || !position) return;
    setError("");
    startTransition(async () => {
      const result = await addShelf(name, Number(position), Number(shelfCount) || 5);
      if (result?.error) {
        setError(result.error);
      } else {
        setName("");
        setPosition("");
        setShelfCount("5");
        setAddOpen(false);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Bu rafı silmek istediğinize emin misiniz? Raftaki kitaplar raftan ayrılacak.")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteShelf(id);
      if (result?.error) setError(result.error);
    });
  }

  function startEdit(shelf: Shelf) {
    setEditId(shelf.id);
    setEditName(shelf.name);
    setEditCount(String(shelf.shelf_count));
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await updateShelf(id, editName, Number(editCount) || 1);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditId(null);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Raflar</CardTitle>
          {!addOpen && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-1" />
              Ekle
            </Button>
          )}
        </div>
      </CardHeader>
      <div className="space-y-3">
        {/* Add form */}
        {addOpen && (
          <div className="flex flex-wrap gap-2 items-end border-b-2 border-border pb-3">
            <Input
              id="shelf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Raf adı"
              className="w-36"
            />
            <Input
              id="shelf-pos"
              type="number"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Sıra no"
              min={1}
              className="w-20"
            />
            <Input
              id="shelf-count"
              type="number"
              value={shelfCount}
              onChange={(e) => setShelfCount(e.target.value)}
              placeholder="Raf sayısı"
              min={1}
              className="w-24"
            />
            <Button size="sm" onClick={handleAdd} disabled={pending || !name.trim() || !position}>
              {pending ? "..." : "Kaydet"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)}>
              <X size={14} />
            </Button>
          </div>
        )}

        {error && (
          <p className="text-xs text-accent-red">{error}</p>
        )}

        {/* Shelf list */}
        {shelves.length > 0 ? (
          <div className="space-y-2">
            {shelves.map((shelf) => (
              <div
                key={shelf.id}
                className="flex items-center gap-2 border-2 border-border px-3 py-2"
              >
                {editId === shelf.id ? (
                  <>
                    <Input
                      id={`edit-shelf-${shelf.id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      id={`edit-count-${shelf.id}`}
                      type="number"
                      value={editCount}
                      onChange={(e) => setEditCount(e.target.value)}
                      min={1}
                      className="w-16"
                    />
                    <button
                      onClick={() => handleUpdate(shelf.id)}
                      disabled={pending}
                      className="text-accent-green hover:opacity-70 transition-opacity"
                      title="Kaydet"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-ink-muted hover:text-ink transition-colors"
                      title="İptal"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-ink font-semibold">{shelf.name}</span>
                    <span className="text-[10px] text-ink-muted uppercase tracking-[0.05em]">
                      {shelf.shelf_count} raf · sıra {shelf.position}
                    </span>
                    <button
                      onClick={() => startEdit(shelf)}
                      className="text-ink-muted hover:text-ink transition-colors ml-2"
                      title="Düzenle"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(shelf.id)}
                      disabled={pending}
                      className="text-ink-muted hover:text-accent-red transition-colors"
                      title="Sil"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">Henüz raf eklenmemiş.</p>
        )}
      </div>
    </Card>
  );
}

export function SettingsManager({ categories, languages, shelves }: Props) {
  return (
    <div className="space-y-4">
      <LookupSection title="Kategoriler" type="category" items={categories} />
      <LookupSection title="Diller" type="language" items={languages} />
      <ShelvesSection shelves={shelves} />
    </div>
  );
}
