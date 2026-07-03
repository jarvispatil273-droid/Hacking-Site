"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, Shield, Terminal } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { OPEN_PALETTE_EVENT } from "./CommandPalette";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { label: "News", href: "/news" },
  { label: "CVE Explorer", href: "/cve" },
  { label: "Search", href: "/search" },
  { label: "CTF", href: "/ctf", soon: true },
  { label: "Bug Bounty", href: "/bounty", soon: true },
  { label: "Learn", href: "/learn", soon: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function openPalette() {
    window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-neon/50 bg-neon/10 text-neon shadow-neon">
            <Shield className="h-5 w-5" />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight">
            AE<span className="neon-text">GIS</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "text-neon" : "text-muted hover:text-fg",
                  l.soon && "opacity-60"
                )}
              >
                {l.label}
                {l.soon && (
                  <span className="ml-1 align-super text-[9px] uppercase text-neon/70">
                    soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={openPalette}
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-neon/60 hover:text-neon sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search</span>
            <kbd className="rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
          </button>

          <ThemeSwitcher />

          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-lg border border-neon/50 bg-neon/10 px-3 py-2 text-sm text-neon transition-all hover:shadow-neon sm:flex"
          >
            <Terminal className="h-4 w-4" />
            Console
          </Link>

          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface-2"
              >
                {l.label}
                {l.soon && (
                  <span className="ml-1 text-[9px] uppercase text-neon/70">soon</span>
                )}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-neon"
            >
              Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
