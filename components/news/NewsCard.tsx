import Link from "next/link";
import { Clock, ExternalLink, Sparkles } from "lucide-react";
import type { Article } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

/** Deterministic hue from a string so each source gets a stable placeholder tint. */
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export function NewsCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  const hue = hueFrom(article.sourceName);
  return (
    <article
      className={cn(
        "card card-hover group flex flex-col overflow-hidden",
        featured && "md:flex-row"
      )}
    >
      <Link
        href={`/news/${article.slug}`}
        className={cn(
          "relative block overflow-hidden",
          featured ? "md:w-2/5" : ""
        )}
      >
        <div
          className={cn(
            "relative aspect-[16/9] w-full",
            featured && "md:h-full"
          )}
          style={{
            background: article.imageUrl
              ? undefined
              : `radial-gradient(circle at 30% 20%, hsl(${hue} 70% 25% / 0.8), transparent 60%), linear-gradient(135deg, rgb(var(--surface-2)), rgb(var(--surface)))`,
          }}
        >
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-mono text-4xl font-bold text-neon/30">
                {article.sourceName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge>{article.category}</Badge>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <span className="font-medium text-fg/80">{article.sourceName}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {timeAgo(article.publishedAt)}
          </span>
        </div>

        <Link href={`/news/${article.slug}`}>
          <h3
            className={cn(
              "font-semibold leading-snug text-fg transition-colors group-hover:text-neon",
              featured ? "text-xl" : "text-base"
            )}
          >
            {article.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
          {article.summary}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            {article.summaryIsAI ? (
              <>
                <Sparkles className="h-3 w-3 text-neon" /> AI summary
              </>
            ) : (
              <>Extractive summary</>
            )}
            <span className="mx-1">·</span>
            {article.readMinutes} min
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-neon"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
