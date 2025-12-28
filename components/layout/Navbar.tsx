"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full flex justify-end items-center px-6 pt-3 pb-0 bg-transparent">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Toggle Theme"
      >
        {theme === "light" ? (
          <Sun className="w-5 h-5 text-slate-500 hover:text-amber-500 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-slate-400 hover:text-indigo-400 transition-colors" />
        )}
      </button>
    </nav>
  );
}