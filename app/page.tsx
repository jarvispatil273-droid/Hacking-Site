import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  ShieldAlert,
  Search,
  Flag,
  Bug,
  GraduationCap,
  Sparkles,
  Rss,
} from "lucide-react";
import { getRepository } from "@/lib/repo";
import { NewsCard } from "@/components/news/NewsCard";
import { HomeHero } from "@/components/home/HomeHero";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { ScrollReveal } from "@/components/fx/ScrollReveal";
import { SeverityBadge } from "@/components/ui/Severity";
import projects from "@/data/seed/projects.json";

export const dynamic = "force-dynamic";

const MODULES = [
  { name: "News Aggregator", href: "/news", icon: Newspaper, desc: "Hourly RSS ingestion, dedup & AI summaries.", live: true },
  { name: "CVE Explorer", href: "/cve", icon: ShieldAlert, desc: "Live NVD search with CVSS triage.", live: true },
  { name: "Unified Search", href: "/search", icon: Search, desc: "One query across news & vulnerabilities.", live: true },
  { name: "CTF Arena", href: "/ctf", icon: Flag, desc: "Jeopardy-style challenges & write-ups.", live: false },
  { name: "Bug Bounty", href: "/bounty", icon: Bug, desc: "Curated programs & disclosure guides.", live: false },
  { name: "Learning", href: "/learn", icon: GraduationCap, desc: "Structured paths from zero to pro.", live: false },
];

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="font-mono text-3xl font-bold text-neon">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted">
        {label}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const repo = getRepository();
  const [{ items: articles }, stats, cves] = await Promise.all([
    repo.listArticles({ pageSize: 7 }),
    repo.stats(),
    repo.searchCves("", 5),
  ]);

  const [featured, ...rest] = articles;

  return (
    <div>
      <HomeHero />

      {/* Stats */}
      <section className="border-y border-border/70 bg-surface/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
          <Stat label="Articles" value={stats.articles} />
          <Stat label="Sources" value={stats.sources} />
          <Stat label="CVEs cached" value={stats.cves} />
          <Stat label="Categories" value={9} />
        </div>
      </section>

      {/* Latest intel */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon/80">
              Latest intel
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Fresh from the wire
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-neon"
          >
            All news <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured ? (
          <div className="grid gap-6">
            <ScrollReveal>
              <NewsCard article={featured} featured />
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.slice(0, 6).map((a, i) => (
                <ScrollReveal key={a.id} delay={i * 0.05}>
                  <NewsCard article={a} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted">
            No articles yet. Run <code className="text-neon">npm run ingest</code>{" "}
            to pull live feeds.
          </p>
        )}
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon/80">
            Platform
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Modules</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <ScrollReveal key={m.name} delay={i * 0.04}>
              <Link
                href={m.href}
                className="card card-hover group flex h-full flex-col p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
                    <m.icon className="h-5 w-5" />
                  </span>
                  {m.live ? (
                    <span className="chip text-neon">live</span>
                  ) : (
                    <span className="chip">soon</span>
                  )}
                </div>
                <h3 className="mt-4 font-semibold text-fg group-hover:text-neon">
                  {m.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{m.desc}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CVE preview + newsletter */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">Notable CVEs</h2>
            <Link
              href="/cve"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon"
            >
              Explore <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {cves.map((c) => (
              <Link
                key={c.id}
                href={`/cve/${c.id}`}
                className="flex items-center gap-4 bg-surface/40 p-4 transition-colors hover:bg-surface-2/60"
              >
                <SeverityBadge severity={c.severity} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-fg">{c.id}</p>
                  <p className="truncate text-xs text-muted">{c.description}</p>
                </div>
                <span className="font-mono text-sm text-neon">
                  {c.cvssScore?.toFixed(1) ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-neon/30 bg-gradient-to-br from-surface to-surface-2 p-8 shadow-inset-neon">
          <Sparkles className="h-8 w-8 text-neon" />
          <h2 className="mt-4 text-2xl font-bold">Critical intel, delivered</h2>
          <p className="mt-2 text-sm text-muted">
            Subscribe for a distilled digest of the threats that matter. No spam,
            unsubscribe anytime.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted">
            <Rss className="h-3.5 w-3.5" /> {projects.length} showcased projects ·
            sources always attributed
          </div>
        </div>
      </section>
    </div>
  );
}
