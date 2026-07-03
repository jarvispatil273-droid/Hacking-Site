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

export interface ListArticlesParams {
  page?: number;
  pageSize?: number;
  category?: Category;
  sourceId?: string;
  query?: string;
}

export interface UpsertResult {
  inserted: number;
  skipped: number;
}

export interface RepoStats {
  articles: number;
  sources: number;
  cves: number;
  backend: "supabase" | "local";
}

/**
 * The single data contract every feature talks to. Two implementations exist:
 * `LocalRepository` (file-backed JSON, default) and `SupabaseRepository`.
 * Selecting between them is env-driven — see `lib/repo/index.ts`.
 */
export interface Repository {
  // ---- Articles ----
  listArticles(params?: ListArticlesParams): Promise<Paginated<Article>>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getArticleById(id: string): Promise<Article | null>;
  searchArticles(query: string, limit?: number): Promise<Article[]>;
  /** Content hashes already stored — used to short-circuit dedup during ingest. */
  existingHashes(): Promise<Set<string>>;
  /** Insert new articles, skipping any whose contentHash already exists. */
  upsertArticles(articles: Article[]): Promise<UpsertResult>;

  // ---- Sources ----
  listSources(): Promise<Source[]>;
  upsertSources(sources: Source[]): Promise<void>;

  // ---- CVEs (cache layer over NVD) ----
  getCve(id: string): Promise<Cve | null>;
  searchCves(query: string, limit?: number): Promise<Cve[]>;
  upsertCves(cves: Cve[]): Promise<void>;

  // ---- Bookmarks ----
  listBookmarks(userId: string): Promise<Bookmark[]>;
  addBookmark(userId: string, articleId: string): Promise<void>;
  removeBookmark(userId: string, articleId: string): Promise<void>;

  // ---- Newsletter ----
  subscribeNewsletter(
    email: string,
    categories: Category[]
  ): Promise<NewsletterSubscription>;
  getSubscription(email: string): Promise<NewsletterSubscription | null>;

  // ---- Notifications ----
  listNotifications(userId: string): Promise<AppNotification[]>;
  addNotifications(notifications: AppNotification[]): Promise<void>;
  markNotificationRead(userId: string, id: string): Promise<void>;

  stats(): Promise<RepoStats>;
}
