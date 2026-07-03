import Link from "next/link";
import { Shield, Github, Rss } from "lucide-react";
import { backendMode } from "@/lib/env";

const COLS = [
  {
    title: "Modules",
    links: [
      { label: "News Aggregator", href: "/news" },
      { label: "CVE Explorer", href: "/cve" },
      { label: "Unified Search", href: "/search" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Roadmap",
    links: [
      { label: "CTF Arena", href: "/ctf" },
      { label: "Bug Bounty", href: "/bounty" },
      { label: "Learning", href: "/learn" },
      { label: "Projects", href: "/projects" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/80 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-neon/50 bg-neon/10 text-neon">
                <Shield className="h-4 w-4" />
              </span>
              <span className="font-mono text-lg font-bold">
                AE<span className="neon-text">GIS</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted">
              AI-summarized cybersecurity intelligence. We summarize, attribute,
              and link to original reporting — we never republish copyrighted
              articles. All trademarks belong to their owners.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted hover:border-neon/60 hover:text-neon"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <Link
                href="/rss"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted hover:border-neon/60 hover:text-neon"
                aria-label="RSS"
              >
                <Rss className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-fg">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-neon"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} AEGIS · For ethical & educational use.</p>
          <p className="chip">
            backend: <span className="text-neon">{backendMode()}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
