"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  BarChart3,
  BookmarkCheck,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/books", label: "Kitaplar", icon: BookOpen },
  { href: "/shelves", label: "Raflar", icon: Library },
  { href: "/reading-list", label: "Liste", icon: BookmarkCheck },
  { href: "/stats", label: "İstatistik", icon: BarChart3 },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        flex items-center justify-around
        h-14 bg-paper border-t-2 border-border
        md:hidden
      "
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex flex-col items-center justify-center gap-0.5
              px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.05em]
              transition-colors duration-150
              ${
                active
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink"
              }
            `}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export { BottomNav };
