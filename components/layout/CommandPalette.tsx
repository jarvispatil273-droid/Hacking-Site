"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, Loader2, Newspaper, ShieldAlert, Compass } from "lucide-react";
import type { SearchResult } from "@/types";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { title: "Latest News", href: "/news", icon: "news" },
  { title: "CVE Explorer", href: "/cve", icon: "cve" },
  { title: "Search", href: "/search", icon: "nav" },
  { title: "Dashboard", href: "/dashboard", icon: "nav" },
] as const;

export const OPEN_PALETTE_EVENT = "aegis:open-palette";

function Icon({ kind }: { kind: string }) {
  if (kind === "article" || kind === "news")
    return <Newspaper className="h-4 w-4 text-neon" />;
  if (kind === "cve") return <ShieldAlert className="h-4 w-4 text-neon" />;
  return <Compass className="h-4 w-4 text-neon" />;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }, []);

  // Global open triggers: Cmd/Ctrl+K and a custom event from the navbar.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const items = query.trim()
    ? results.map((r) => ({ title: r.title, href: r.href, meta: r.meta, kind: r.type }))
    : NAV_LINKS.map((l) => ({ title: l.title, href: l.href, meta: "", kind: l.icon }));

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active].href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-neon/40 bg-surface/95 shadow-neon-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search news & CVEs, or jump to a page…"
            className="h-14 flex-1 bg-transparent text-fg placeholder:text-muted focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-neon" />}
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              {query ? "No results." : "Start typing…"}
            </p>
          )}
          {items.map((item, i) => (
            <button
              key={`${item.href}-${i}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                i === active ? "bg-neon/10" : "hover:bg-surface-2/60"
              )}
            >
              <Icon kind={item.kind} />
              <span className="flex-1 truncate text-sm text-fg">{item.title}</span>
              {item.meta && (
                <span className="truncate text-xs text-muted">{item.meta}</span>
              )}
              {i === active && (
                <CornerDownLeft className="h-3.5 w-3.5 text-muted" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
