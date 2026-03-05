"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      className="
        inline-flex items-center justify-center w-9 h-9
        border-2 border-border text-ink
        hover:bg-ink hover:text-paper
        transition-colors duration-150 cursor-pointer
      "
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export { ThemeToggle };
