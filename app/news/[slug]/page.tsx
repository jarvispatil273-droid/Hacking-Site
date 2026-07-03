import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  User,
  Sparkles,
  Info,
} from "lucide-react";
import { getRepository } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge, Tag } from "@/components/ui/Badge";
import { BookmarkButton } from "@/components/news/BookmarkButton";
import { NewsCard } from "@/components/news/NewsCard";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/dates";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getRepository().getArticleBySlug(slug);
  if (!article) return pageMetadata({ title: "Not found", noindex: true });
  return pageMetadata({
    title: article.title,
    description: article.summary,
    path: `/news/${slug}`,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = getRepository();
  const article = await repo.getArticleBySlug(slug);
  if (!article) notFound();

  const [user, related] = await Promise.all([
    getCurrentUser(),
    repo.listArticles({ category: article.category, pageSize: 4 }),
  ]);
  const bookmarks = await repo.listBookmarks(user.id);
  const isBookmarked = bookmarks.some((b) => b.articleId === article.id);
  const relatedItems = related.items.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Badge glow>{article.category}</Badge>
        {article.tags.slice(0, 4).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <h1 className="mt-4 text-balance text-3xl font-bold leading-tight sm:text-4xl">
        {article.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span className="font-medium text-fg">{article.sourceName}</span>
        {article.author && (
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> {article.author}
          </span>
        )}
        <span>{formatDate(article.publishedAt)}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {article.readMinutes} min read
        </span>
      </div>

      {/* AI summary — the core value, clearly labeled */}
      <section className="mt-8 rounded-2xl border border-neon/30 bg-surface/50 p-6 shadow-inset-neon">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neon">
            {article.summaryIsAI ? "AI-generated summary" : "Extractive summary"}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-fg/90">{article.summary}</p>
      </section>

      {/* Short excerpt (never the full body) */}
      <div className="prose prose-cyber mt-8 max-w-none">
        <p className="text-muted">{article.excerpt}</p>
      </div>

      {/* Attribution + actions */}
      <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-border bg-surface/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-xs text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
          <span>
            This is an original summary of reporting by{" "}
            <span className="text-fg">{article.sourceName}</span>. AEGIS does not
            republish full articles. Read the complete story at the source.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton articleId={article.id} initial={isBookmarked} />
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 rounded-lg border border-neon/50 bg-neon/10 px-4 py-2 text-sm text-neon transition-all hover:shadow-neon"
          >
            Read original <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-lg font-bold">
            More in <span className="neon-text">{article.category}</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedItems.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
