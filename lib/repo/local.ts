import fs from "node:fs";
import path from "node:path";
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
import { fnv1a } from "@/lib/utils/hash";
import type {
  ListArticlesParams,
  Repository,
  RepoStats,
  UpsertResult,
} from "./repository";

const DATA_DIR = path.join(process.cwd(), ".data");
const SEED_DIR = path.join(process.cwd(), "data", "seed");

/**
 * Zero-dependency JSON store. Each "table" is one file under `.data/`, seeded on
 * first access from `data/seed/`. Good enough to run the whole app with no
 * external services; swap to Supabase by setting env (see lib/repo/index.ts).
 */
class JsonTable<T> {
  constructor(
    private file: string,
    private seedFile?: string
  ) {}

  private pathFor() {
    return path.join(DATA_DIR, this.file);
  }

  read(): T[] {
    const p = this.pathFor();
    if (!fs.existsSync(p)) {
      const seeded = this.loadSeed();
      this.write(seeded);
      return seeded;
    }
    try {
      return JSON.parse(fs.readFileSync(p, "utf8")) as T[];
    } catch {
      return [];
    }
  }

  write(rows: T[]): void {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(this.pathFor(), JSON.stringify(rows, null, 2), "utf8");
  }

  private loadSeed(): T[] {
    if (!this.seedFile) return [];
    const p = path.join(SEED_DIR, this.seedFile);
    if (!fs.existsSync(p)) return [];
    try {
      return JSON.parse(fs.readFileSync(p, "utf8")) as T[];
    } catch {
      return [];
    }
  }
}

export class LocalRepository implements Repository {
  private articles = new JsonTable<Article>("articles.json", "news.json");
  private sources = new JsonTable<Source>("sources.json", "sources.json");
  private cves = new JsonTable<Cve>("cves.json", "cve.json");
  private bookmarks = new JsonTable<Bookmark>("bookmarks.json");
  private newsletter = new JsonTable<NewsletterSubscription>("newsletter.json");
  private notifications = new JsonTable<AppNotification>("notifications.json");

  // ---- Articles ----
  async listArticles(params: ListArticlesParams = {}): Promise<Paginated<Article>> {
    const { page = 1, pageSize = 12, category, sourceId, query } = params;
    let rows = this.articles
      .read()
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

    if (category) rows = rows.filter((a) => a.category === category);
    if (sourceId) rows = rows.filter((a) => a.sourceId === sourceId);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    return { items: rows.slice(start, start + pageSize), total, page, pageSize };
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    return this.articles.read().find((a) => a.slug === slug) ?? null;
  }

  async getArticleById(id: string): Promise<Article | null> {
    return this.articles.read().find((a) => a.id === id) ?? null;
  }

  async searchArticles(query: string, limit = 20): Promise<Article[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);
    const scored = this.articles
      .read()
      .map((a) => {
        const hay = `${a.title} ${a.summary} ${a.tags.join(" ")}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (a.title.toLowerCase().includes(t)) score += 3;
          if (hay.includes(t)) score += 1;
        }
        return { a, score };
      })
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score);
    return scored.slice(0, limit).map((x) => x.a);
  }

  async existingHashes(): Promise<Set<string>> {
    return new Set(this.articles.read().map((a) => a.contentHash));
  }

  async upsertArticles(incoming: Article[]): Promise<UpsertResult> {
    const rows = this.articles.read();
    const byHash = new Set(rows.map((a) => a.contentHash));
    const byCanonical = new Set(rows.map((a) => a.canonicalUrl));
    const slugs = new Set(rows.map((a) => a.slug));

    let inserted = 0;
    let skipped = 0;
    for (const art of incoming) {
      if (byHash.has(art.contentHash) || byCanonical.has(art.canonicalUrl)) {
        skipped++;
        continue;
      }
      // Guarantee slug uniqueness locally.
      let slug = art.slug;
      while (slugs.has(slug)) slug = `${art.slug}-${fnv1a(art.url + inserted)}`;
      const finalized = { ...art, slug };
      rows.push(finalized);
      byHash.add(art.contentHash);
      byCanonical.add(art.canonicalUrl);
      slugs.add(slug);
      inserted++;
    }
    if (inserted > 0) this.articles.write(rows);
    return { inserted, skipped };
  }

  // ---- Sources ----
  async listSources(): Promise<Source[]> {
    return this.sources.read();
  }

  async upsertSources(sources: Source[]): Promise<void> {
    const rows = this.sources.read();
    const byId = new Map(rows.map((s) => [s.id, s]));
    for (const s of sources) byId.set(s.id, { ...byId.get(s.id), ...s });
    this.sources.write([...byId.values()]);
  }

  // ---- CVEs ----
  async getCve(id: string): Promise<Cve | null> {
    return (
      this.cves.read().find((c) => c.id.toUpperCase() === id.toUpperCase()) ?? null
    );
  }

  async searchCves(query: string, limit = 20): Promise<Cve[]> {
    const q = query.trim().toLowerCase();
    let rows = this.cves
      .read()
      .sort((a, b) => +new Date(b.published) - +new Date(a.published));
    if (q) {
      rows = rows.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.cwe.some((w) => w.toLowerCase().includes(q))
      );
    }
    return rows.slice(0, limit);
  }

  async upsertCves(cves: Cve[]): Promise<void> {
    const rows = this.cves.read();
    const byId = new Map(rows.map((c) => [c.id.toUpperCase(), c]));
    for (const c of cves) byId.set(c.id.toUpperCase(), c);
    this.cves.write([...byId.values()]);
  }

  // ---- Bookmarks ----
  async listBookmarks(userId: string): Promise<Bookmark[]> {
    return this.bookmarks.read().filter((b) => b.userId === userId);
  }

  async addBookmark(userId: string, articleId: string): Promise<void> {
    const rows = this.bookmarks.read();
    if (rows.some((b) => b.userId === userId && b.articleId === articleId)) return;
    rows.push({ userId, articleId, createdAt: toISO() });
    this.bookmarks.write(rows);
  }

  async removeBookmark(userId: string, articleId: string): Promise<void> {
    const rows = this.bookmarks
      .read()
      .filter((b) => !(b.userId === userId && b.articleId === articleId));
    this.bookmarks.write(rows);
  }

  // ---- Newsletter ----
  async subscribeNewsletter(
    email: string,
    categories: Category[]
  ): Promise<NewsletterSubscription> {
    const rows = this.newsletter.read();
    const existing = rows.find((s) => s.email === email);
    const sub: NewsletterSubscription = {
      email,
      categories,
      confirmed: existing?.confirmed ?? false,
      createdAt: existing?.createdAt ?? toISO(),
    };
    const next = rows.filter((s) => s.email !== email);
    next.push(sub);
    this.newsletter.write(next);
    return sub;
  }

  async getSubscription(email: string): Promise<NewsletterSubscription | null> {
    return this.newsletter.read().find((s) => s.email === email) ?? null;
  }

  // ---- Notifications ----
  async listNotifications(userId: string): Promise<AppNotification[]> {
    return this.notifications
      .read()
      .filter((n) => n.userId === userId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  async addNotifications(notifications: AppNotification[]): Promise<void> {
    if (notifications.length === 0) return;
    const rows = this.notifications.read();
    rows.push(...notifications);
    // Keep the store bounded.
    this.notifications.write(rows.slice(-500));
  }

  async markNotificationRead(userId: string, id: string): Promise<void> {
    const rows = this.notifications.read();
    for (const n of rows) if (n.userId === userId && n.id === id) n.read = true;
    this.notifications.write(rows);
  }

  async stats(): Promise<RepoStats> {
    return {
      articles: this.articles.read().length,
      sources: this.sources.read().length,
      cves: this.cves.read().length,
      backend: "local",
    };
  }
}
