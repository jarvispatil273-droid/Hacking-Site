import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { CATEGORIES, type Category } from "@/types";
import { getRepository } from "@/lib/repo";
import { NewsCard } from "@/components/news/NewsCard";
import { CategoryFilter } from "@/components/news/CategoryFilter";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "News",
  description:
    "AI-summarized cybersecurity news aggregated from trusted sources, always attributed and linked.",
  path: "/news",
});

const PAGE_SIZE = 12;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const category = CATEGORIES.includes(sp.category as Category)
    ? (sp.category as Category)
    : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const repo = getRepository();
  const { items, total } = await repo.listArticles({
    category,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Aggregated & summarized"
        title="Security News Feed"
        subtitle="Summarized by AI, attributed to the source. We never republish full articles — every card links to the original reporting."
      >
        <CategoryFilter active={category} />
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
            <p className="text-muted">
              No articles in this view yet. Run{" "}
              <code className="text-neon">npm run ingest</code> to pull live
              feeds, or check another category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between">
              <span className="text-xs text-muted">
                Page {page} of {totalPages} · {total} articles
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={hrefFor(page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-neon/60 hover:text-neon"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={hrefFor(page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:border-neon/60 hover:text-neon"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
