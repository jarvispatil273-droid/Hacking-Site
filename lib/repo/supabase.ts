import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppNotification,
  Article,
  Bookmark,
  Category,
  Cve,
  NewsletterSubscription,
  Paginated,
  Source,
} from "@/types";
import { toISO } from "@/lib/utils/dates";
import { getAdminClient } from "@/lib/supabase/admin";
import type {
  ListArticlesParams,
  Repository,
  RepoStats,
  UpsertResult,
} from "./repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

function toArticle(r: any): Article {
  return {
    id: r.id,
    slug: r.slug,
    sourceId: r.source_id,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    title: r.title,
    url: r.url,
    canonicalUrl: r.canonical_url,
    author: r.author,
    publishedAt: r.published_at,
    fetchedAt: r.fetched_at,
    excerpt: r.excerpt,
    summary: r.summary,
    summaryIsAI: r.summary_is_ai,
    category: r.category,
    tags: r.tags ?? [],
    imageUrl: r.image_url,
    readMinutes: r.read_minutes ?? 1,
    contentHash: r.content_hash,
  };
}

function fromArticle(a: Article) {
  return {
    id: a.id,
    slug: a.slug,
    source_id: a.sourceId,
    source_name: a.sourceName,
    source_url: a.sourceUrl,
    title: a.title,
    url: a.url,
    canonical_url: a.canonicalUrl,
    author: a.author ?? null,
    published_at: a.publishedAt,
    fetched_at: a.fetchedAt,
    excerpt: a.excerpt,
    summary: a.summary,
    summary_is_ai: a.summaryIsAI,
    category: a.category,
    tags: a.tags,
    image_url: a.imageUrl ?? null,
    read_minutes: a.readMinutes,
    content_hash: a.contentHash,
  };
}

function toCve(r: any): Cve {
  return {
    id: r.id,
    description: r.description,
    cvssScore: r.cvss_score,
    severity: r.severity,
    cvssVector: r.cvss_vector,
    published: r.published,
    lastModified: r.last_modified,
    cwe: r.cwe ?? [],
    references: r.references ?? [],
    cachedAt: r.cached_at,
  };
}

/** Supabase-backed repository. Used when SUPABASE url + service key are set. */
export class SupabaseRepository implements Repository {
  private db: SupabaseClient;

  constructor() {
    const client = getAdminClient();
    if (!client) throw new Error("SupabaseRepository requires admin client");
    this.db = client;
  }

  async listArticles(params: ListArticlesParams = {}): Promise<Paginated<Article>> {
    const { page = 1, pageSize = 12, category, sourceId, query } = params;
    let q = this.db
      .from("articles")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false });

    if (category) q = q.eq("category", category);
    if (sourceId) q = q.eq("source_id", sourceId);
    if (query) q = q.textSearch("fts", query, { type: "websearch" });

    const from = (page - 1) * pageSize;
    q = q.range(from, from + pageSize - 1);

    const { data, count, error } = await q;
    if (error) throw error;
    return {
      items: (data ?? []).map(toArticle),
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data } = await this.db
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? toArticle(data) : null;
  }

  async getArticleById(id: string): Promise<Article | null> {
    const { data } = await this.db
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toArticle(data) : null;
  }

  async searchArticles(query: string, limit = 20): Promise<Article[]> {
    if (!query.trim()) return [];
    const { data, error } = await this.db
      .from("articles")
      .select("*")
      .textSearch("fts", query, { type: "websearch" })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toArticle);
  }

  async existingHashes(): Promise<Set<string>> {
    const { data } = await this.db.from("articles").select("content_hash");
    return new Set((data ?? []).map((r: any) => r.content_hash));
  }

  async upsertArticles(incoming: Article[]): Promise<UpsertResult> {
    const existing = await this.existingHashes();
    const fresh = incoming.filter((a) => !existing.has(a.contentHash));
    if (fresh.length === 0) return { inserted: 0, skipped: incoming.length };
    const { error } = await this.db
      .from("articles")
      .upsert(fresh.map(fromArticle), { onConflict: "content_hash", ignoreDuplicates: true });
    if (error) throw error;
    return { inserted: fresh.length, skipped: incoming.length - fresh.length };
  }

  async listSources(): Promise<Source[]> {
    const { data } = await this.db.from("sources").select("*").order("name");
    return (data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      feedUrl: r.feed_url,
      category: r.category,
      enabled: r.enabled,
    }));
  }

  async upsertSources(sources: Source[]): Promise<void> {
    await this.db.from("sources").upsert(
      sources.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        feed_url: s.feedUrl,
        category: s.category ?? null,
        enabled: s.enabled,
      })),
      { onConflict: "id" }
    );
  }

  async getCve(id: string): Promise<Cve | null> {
    const { data } = await this.db
      .from("cves")
      .select("*")
      .ilike("id", id)
      .maybeSingle();
    return data ? toCve(data) : null;
  }

  async searchCves(query: string, limit = 20): Promise<Cve[]> {
    let q = this.db
      .from("cves")
      .select("*")
      .order("published", { ascending: false })
      .limit(limit);
    if (query.trim()) q = q.or(`id.ilike.%${query}%,description.ilike.%${query}%`);
    const { data } = await q;
    return (data ?? []).map(toCve);
  }

  async upsertCves(cves: Cve[]): Promise<void> {
    await this.db.from("cves").upsert(
      cves.map((c) => ({
        id: c.id,
        description: c.description,
        cvss_score: c.cvssScore,
        severity: c.severity,
        cvss_vector: c.cvssVector ?? null,
        published: c.published,
        last_modified: c.lastModified,
        cwe: c.cwe,
        references: c.references,
        cached_at: toISO(),
      })),
      { onConflict: "id" }
    );
  }

  async listBookmarks(userId: string): Promise<Bookmark[]> {
    const { data } = await this.db
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId);
    return (data ?? []).map((r: any) => ({
      userId: r.user_id,
      articleId: r.article_id,
      createdAt: r.created_at,
    }));
  }

  async addBookmark(userId: string, articleId: string): Promise<void> {
    await this.db
      .from("bookmarks")
      .upsert(
        { user_id: userId, article_id: articleId, created_at: toISO() },
        { onConflict: "user_id,article_id" }
      );
  }

  async removeBookmark(userId: string, articleId: string): Promise<void> {
    await this.db
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId);
  }

  async subscribeNewsletter(
    email: string,
    categories: Category[]
  ): Promise<NewsletterSubscription> {
    const row = {
      email,
      categories,
      confirmed: false,
      created_at: toISO(),
    };
    await this.db.from("newsletter_subscriptions").upsert(row, { onConflict: "email" });
    return { email, categories, confirmed: false, createdAt: row.created_at };
  }

  async getSubscription(email: string): Promise<NewsletterSubscription | null> {
    const { data } = await this.db
      .from("newsletter_subscriptions")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (!data) return null;
    return {
      email: data.email,
      categories: data.categories ?? [],
      confirmed: data.confirmed,
      createdAt: data.created_at,
    };
  }

  async listNotifications(userId: string): Promise<AppNotification[]> {
    const { data } = await this.db
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      body: r.body,
      href: r.href,
      read: r.read,
      createdAt: r.created_at,
    }));
  }

  async addNotifications(notifications: AppNotification[]): Promise<void> {
    if (notifications.length === 0) return;
    await this.db.from("notifications").insert(
      notifications.map((n) => ({
        id: n.id,
        user_id: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        href: n.href ?? null,
        read: n.read,
        created_at: n.createdAt,
      }))
    );
  }

  async markNotificationRead(userId: string, id: string): Promise<void> {
    await this.db
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("id", id);
  }

  async stats(): Promise<RepoStats> {
    const [a, s, c] = await Promise.all([
      this.db.from("articles").select("id", { count: "exact", head: true }),
      this.db.from("sources").select("id", { count: "exact", head: true }),
      this.db.from("cves").select("id", { count: "exact", head: true }),
    ]);
    return {
      articles: a.count ?? 0,
      sources: s.count ?? 0,
      cves: c.count ?? 0,
      backend: "supabase",
    };
  }
}
