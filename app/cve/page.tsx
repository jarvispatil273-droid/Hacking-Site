import Link from "next/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { SEVERITIES, type Severity } from "@/types";
import { searchCves } from "@/lib/cve/nvd";
import { CveCard } from "@/components/cve/CveCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "CVE Explorer",
  description:
    "Search the National Vulnerability Database live. Triage by CVSS score and severity.",
  path: "/cve",
});

export default async function CvePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; severity?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const severity = SEVERITIES.includes(sp.severity as Severity)
    ? (sp.severity as Severity)
    : undefined;

  // Live NVD (falls back to cached/seed data when offline). Empty query returns
  // recent/seeded CVEs so the page is never blank.
  let results = await searchCves(q || "", 30);
  if (severity) results = results.filter((c) => c.severity === severity);

  const sevHref = (s?: Severity) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s) params.set("severity", s);
    const qs = params.toString();
    return `/cve${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="National Vulnerability Database"
        title="CVE Explorer"
        subtitle="Search vulnerabilities live from NVD 2.0. Enter a CVE ID (e.g. CVE-2021-44228) or keywords like 'log4j', 'openssl', 'rce'."
      >
        <form action="/cve" method="get" className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search CVEs…"
              className="h-12 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-neon/60 focus:outline-none focus:ring-2 focus:ring-neon/40"
            />
          </div>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={sevHref(undefined)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-all",
              !severity
                ? "border-neon/60 bg-neon/15 text-neon"
                : "border-border text-muted hover:text-fg"
            )}
          >
            All severities
          </Link>
          {SEVERITIES.filter((s) => s !== "NONE").map((s) => (
            <Link
              key={s}
              href={sevHref(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-all",
                severity === s
                  ? "border-neon/60 bg-neon/15 text-neon"
                  : "border-border text-muted hover:text-fg"
              )}
            >
              {s}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="mb-6 text-xs text-muted">
          {results.length} result{results.length === 1 ? "" : "s"}
          {q && (
            <>
              {" "}
              for <span className="text-neon">“{q}”</span>
            </>
          )}
        </p>
        {results.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/40 p-10 text-center text-muted">
            No CVEs matched. Try a broader keyword or a specific CVE ID.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <CveCard key={c.id} cve={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
