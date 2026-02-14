"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, X } from "lucide-react";

function ShelfActions() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [shelfCount, setShelfCount] = useState("5");

  async function handleAdd() {
    if (!name || !position) return;
    setLoading(true);

    const { error } = await supabase.from("shelves").insert({
      name,
      position: Number(position),
      shelf_count: Number(shelfCount) || 5,
    });

    if (!error) {
      setName("");
      setPosition("");
      setShelfCount("5");
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} className="mr-1" />
        Ekle
      </Button>
    );
  }

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <Input
        id="shelf-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Raf adı"
        className="w-32"
      />
      <Input
        id="shelf-position"
        type="number"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Sıra"
        min={1}
        className="w-16"
      />
      <Input
        id="shelf-count"
        type="number"
        value={shelfCount}
        onChange={(e) => setShelfCount(e.target.value)}
        placeholder="Raf"
        min={1}
        className="w-16"
      />
      <Button size="sm" onClick={handleAdd} disabled={loading}>
        {loading ? "..." : "Kaydet"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        <X size={14} />
      </Button>
    </div>
  );
}

export { ShelfActions };
