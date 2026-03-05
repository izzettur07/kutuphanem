"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

function Header({ title, children }: HeaderProps) {
  return (
    <header
      className="
        flex items-center justify-between
        h-14 px-4 border-b-2 border-border
        bg-paper
      "
    >
      <h1
        className="
          text-sm font-semibold uppercase tracking-[0.05em]
          text-ink
        "
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {children}
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        <Link
          href="/profile"
          className="
            md:hidden inline-flex items-center justify-center w-9 h-9
            border-2 border-border text-ink
            hover:bg-ink hover:text-paper
            transition-colors duration-150
          "
          aria-label="Profil"
        >
          <User size={16} />
        </Link>
      </div>
    </header>
  );
}

export { Header };
export type { HeaderProps };
