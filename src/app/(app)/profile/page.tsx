"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [readingGoal, setReadingGoal] = useState("");
  const [stats, setStats] = useState({ read: 0, reading: 0, total: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username);
        setFullName(profileData.full_name ?? "");
        setReadingGoal(profileData.reading_goal ? String(profileData.reading_goal) : "");
      }

      const { data: userBooks } = await supabase
        .from("user_books")
        .select("status")
        .eq("user_id", user.id);

      setStats({
        read: userBooks?.filter((b) => b.status === "read").length ?? 0,
        reading: userBooks?.filter((b) => b.status === "reading").length ?? 0,
        total: userBooks?.length ?? 0,
      });

      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        username,
        full_name: fullName || null,
        reading_goal: readingGoal ? Number(readingGoal) : null,
      })
      .eq("id", profile.id);

    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <>
        <Header title="Profil" />
        <div className="p-4">
          <p className="text-sm text-ink-muted">Yükleniyor...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Profil" />
      <div className="p-4 space-y-4 max-w-lg">
        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle>Bilgilerim</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <Input
              id="username"
              label="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              id="full_name"
              label="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              id="reading_goal"
              label="Yıllık Okuma Hedefi"
              type="number"
              value={readingGoal}
              onChange={(e) => setReadingGoal(e.target.value)}
              min={1}
              placeholder="Ör: 24"
            />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </Card>

        {/* Reading stats */}
        <Card>
          <CardHeader>
            <CardTitle>Okuma Özeti</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Okunan kitap</span>
              <span className="font-semibold text-ink">{stats.read}</span>
            </div>
            <div className="border-t border-dashed border-ink-muted" />
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Okunan / Hedef</span>
              <span className="font-semibold text-ink">
                {stats.read} / {readingGoal || "—"}
              </span>
            </div>
            <div className="border-t border-dashed border-ink-muted" />
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Şu an okuyor</span>
              <span className="font-semibold text-ink">{stats.reading}</span>
            </div>
            <div className="border-t border-dashed border-ink-muted" />
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Toplam listede</span>
              <span className="font-semibold text-ink">{stats.total}</span>
            </div>
          </div>
        </Card>

        {/* Sign out */}
        <Button variant="danger" onClick={handleSignOut} className="w-full">
          <LogOut size={14} className="mr-1" />
          Çıkış Yap
        </Button>
      </div>
    </>
  );
}
