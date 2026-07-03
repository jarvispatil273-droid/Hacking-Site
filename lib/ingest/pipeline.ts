import type { Article } from "@/types";
import { getRepository } from "@/lib/repo";
import { enrich } from "@/lib/ai";
import { hasOpenAI } from "@/lib/env";
import { GUEST_USER_ID } from "@/lib/auth/constants";
import { canonicalizeUrl } from "@/lib/utils/url";
import { contentHash, fnv1a } from "@/lib/utils/hash";
import { toISO } from "@/lib/utils/dates";
import { readingMinutes, slugify, toExcerpt } from "@/lib/utils/text";
import { DEFAULT_SOURCES } from "./sources";
import { fetchFeed } from "./rss";
import { isNearDuplicate } from "./dedup";

export interface IngestOptions {
  /** Max items pulled per feed per run. */
  limitPerFeed?: number;
  /** Emit an in-app notification for the guest user on new items (default true). */
  notify?: boolean;
}

export interface IngestReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  feeds: number;
  fetched: number;
  candidates: number;
  inserted: number;
  skipped: number;
  aiUsed: boolean;
  perSource: { source: string; fetched: number; new: number; skipped: number }[];
}

/**
 * The end-to-end ingestion pipeline: fetch feeds → normalize → dedup (exact via
 * contentHash + near-dup via title similarity) → AI enrich (summary/category/
 * tags, with deterministic fallback) → persist → notify. Idempotent: re-running
 * inserts nothing new because contentHash/canonicalUrl already exist.
 */
export async function runIngest(opts: IngestOptions = {}): Promise<IngestReport> {
  const started = Date.now();
  const limitPerFeed = opts.limitPerFeed ?? 15;
  const repo = getRepository();

  // Ensure sources exist (first run seeds them).
  let sources = await repo.listSources();
  if (sources.length === 0) {
    await repo.upsertSources(DEFAULT_SOURCES);
    sources = DEFAULT_SOURCES;
  }
  const enabled = sources.filter((s) => s.enabled);

  const existing = await repo.existingHashes();
  const seenTitles: string[] = [];
  const candidates: Article[] = [];
  const perSource: IngestReport["perSource"] = [];
  let fetched = 0;

  for (const src of enabled) {
    const items = await fetchFeed(src.feedUrl);
    fetched += items.length;
    let added = 0;
    let skipped = 0;

    for (const it of items.slice(0, limitPerFeed)) {
      const canonical = canonicalizeUrl(it.link);
      const hash = contentHash(it.title, canonical);
      if (existing.has(hash) || isNearDuplicate(it.title, seenTitles)) {
        skipped++;
        continue;
      }

      const excerpt = toExcerpt(it.contentSnippet || it.title, 50);
      const { summary, summaryIsAI, category, tags } = await enrich({
        title: it.title,
        excerpt,
        sourceName: src.name,
        defaultCategory: src.category,
      });

      const slug = `${slugify(it.title).slice(0, 60)}-${fnv1a(hash)}`;
      candidates.push({
        id: hash,
        slug,
        sourceId: src.id,
        sourceName: src.name,
        sourceUrl: src.url,
        title: it.title,
        url: it.link,
        canonicalUrl: canonical,
        author: it.creator ?? null,
        publishedAt: toISO(it.isoDate),
        fetchedAt: toISO(),
        excerpt,
        summary,
        summaryIsAI,
        category,
        tags,
        imageUrl: it.imageUrl,
        readMinutes: readingMinutes(excerpt),
        contentHash: hash,
      });

      existing.add(hash);
      seenTitles.push(it.title);
      added++;
    }

    perSource.push({ source: src.name, fetched: items.length, new: added, skipped });
  }

  const { inserted, skipped } = await repo.upsertArticles(candidates);

  if (opts.notify !== false && inserted > 0) {
    const byCat = candidates.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    }, {});
    const breakdown = Object.entries(byCat)
      .map(([c, n]) => `${n} ${c}`)
      .join(", ");
    await repo.addNotifications([
      {
        id: `ingest-${started}`,
        userId: GUEST_USER_ID,
        type: "new-articles",
        title: `${inserted} new article${inserted === 1 ? "" : "s"} ingested`,
        body: breakdown || "Fresh intelligence is available.",
        href: "/news",
        read: false,
        createdAt: toISO(),
      },
    ]);
  }

  const finished = Date.now();
  return {
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    feeds: enabled.length,
    fetched,
    candidates: candidates.length,
    inserted,
    skipped,
    aiUsed: hasOpenAI(),
    perSource,
  };
}
