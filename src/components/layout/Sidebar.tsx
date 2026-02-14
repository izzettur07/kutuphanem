"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  BarChart3,
  BookmarkCheck,
  User,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/books", label: "Kitaplar", icon: BookOpen },
  { href: "/shelves", label: "Raflar", icon: Library },
  { href: "/reading-list", label: "Okuma Listesi", icon: BookmarkCheck },
  { href: "/stats", label: "İstatistik", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        hidden md:flex md:flex-col md:w-56 md:min-h-screen
        bg-paper border-r-2 border-ink
        dark:bg-paper-dark dark:border-paper
      "
    >
      <div className="p-4 border-b-2 border-ink dark:border-paper">
        <Link
          href="/dashboard"
          className="text-sm font-semibold uppercase tracking-[0.05em] text-ink dark:text-paper"
        >
          KÜTÜPHANEM
        </Link>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 mb-1
                text-xs font-semibold uppercase tracking-[0.05em]
                transition-colors duration-150
                ${
                  active
                    ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                    : "text-ink hover:bg-ink hover:text-paper dark:text-paper dark:hover:bg-paper dark:hover:text-ink"
                }
              `}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-ink dark:border-paper">
        <ThemeToggle />
      </div>
    </aside>
  );
}

export { Sidebar };
