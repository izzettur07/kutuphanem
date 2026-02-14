import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, BookCheck, BookMarked, Library } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { count: totalBooks } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true });

  const { count: totalShelves } = await supabase
    .from("shelves")
    .select("*", { count: "exact", head: true });

  const { data: userBooks } = await supabase
    .from("user_books")
    .select("*")
    .eq("user_id", user?.id ?? "");

  const reading = userBooks?.filter((b) => b.status === "reading").length ?? 0;
  const read = userBooks?.filter((b) => b.status === "read").length ?? 0;
  const wantToRead = userBooks?.filter(
    (b) => b.status === "to_read" || b.status === "wishlist"
  ).length ?? 0;

  const stats = [
    { label: "Toplam Kitap", value: totalBooks ?? 0, icon: BookOpen },
    { label: "Okuyorum", value: reading, icon: BookMarked },
    { label: "Okudum", value: read, icon: BookCheck },
    { label: "Raf Sayısı", value: totalShelves ?? 0, icon: Library },
  ];

  return (
    <>
      <Header title="Panel" />
      <div className="p-4 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-ink-muted" />
                <div>
                  <p className="text-2xl font-semibold text-ink dark:text-paper">
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                    {label}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reading list preview */}
        <Card>
          <CardHeader>
            <CardTitle>Okuma Durumu</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-semibold text-accent-blue">{reading}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                Okuyorum
              </p>
            </div>
            <div className="border-x-2 border-ink dark:border-paper">
              <p className="text-xl font-semibold text-accent-green">{read}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                Okudum
              </p>
            </div>
            <div>
              <p className="text-xl font-semibold text-accent-amber">{wantToRead}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                Okuyacağım
              </p>
            </div>
          </div>
        </Card>

        {/* Quick info */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Bilgi</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Toplam kitap</span>
              <span className="font-semibold text-ink dark:text-paper">{totalBooks ?? 0}</span>
            </div>
            <div className="border-t border-dashed border-ink-muted" />
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Raf sayısı</span>
              <span className="font-semibold text-ink dark:text-paper">{totalShelves ?? 0}</span>
            </div>
            <div className="border-t border-dashed border-ink-muted" />
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Kişisel liste</span>
              <span className="font-semibold text-ink dark:text-paper">{userBooks?.length ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
