"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME;
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function apply(id: string) {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-neon/60 hover:text-neon"
      >
        <Palette className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface/95 p-1 shadow-neon backdrop-blur">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                theme === t.id ? "text-neon" : "text-fg"
              )}
            >
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-white/20"
                style={{ background: t.swatch }}
              />
              <span className="flex-1">{t.name}</span>
              {theme === t.id && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
