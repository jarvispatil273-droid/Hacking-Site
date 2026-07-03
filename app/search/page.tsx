import Link from "next/link";
import { Search, Newspaper, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { unifiedSearch } from "@/lib/search";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  description: "Unified search across cybersecurity news and CVEs.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 120);
  const results = q ? await unifiedSearch(q, 30) : [];

  return (
    <div>
      <PageHeader
        eyebrow="One query, all signals"
        title="Unified Search"
        subtitle="Search across summarized news and vulnerabilities at once. Tip: press ⌘K anywhere for the command palette."
      >
        <form action="/search" method="get" className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="ransomware, CVE-2021-44228, oauth phishing…"
              className="h-12 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-fg placeholder:text-muted focus:border-neon/60 focus:outline-none focus:ring-2 focus:ring-neon/40"
            />
          </div>
        </form>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {!q ? (
          <p className="text-center text-muted">
            Enter a query to search news and CVEs.
          </p>
        ) : results.length === 0 ? (
          <p className="text-center text-muted">
            No results for <span className="text-neon">“{q}”</span>.
          </p>
        ) : (
          <>
            <p className="mb-6 text-xs text-muted">
              {results.length} result{results.length === 1 ? "" : "s"} for{" "}
              <span className="text-neon">“{q}”</span>
            </p>
            <div className="space-y-3">
              {results.map((r) => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  className="card card-hover flex items-start gap-4 p-4"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
                    {r.type === "cve" ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : (
                      <Newspaper className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-fg">{r.title}</p>
                      <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted">
                        {r.type}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {r.description}
                    </p>
                    {r.meta && (
                      <p className="mt-1 text-xs text-neon/80">{r.meta}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
