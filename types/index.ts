// Core domain types shared across the app, ingestion pipeline, and repositories.

export const CATEGORIES = [
  "Threats",
  "Vulnerabilities",
  "Malware",
  "Data Breach",
  "Cloud",
  "AppSec",
  "Policy",
  "Research",
  "Tools",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"] as const;
export type Severity = (typeof SEVERITIES)[number];

export interface Source {
  id: string;
  name: string;
  /** Homepage / brand URL, used for attribution links. */
  url: string;
  /** RSS/Atom feed URL polled by the ingestion pipeline. */
  feedUrl: string;
  /** Default category hint for items from this source (AI may override). */
  category?: Category;
  enabled: boolean;
}

export interface Article {
  id: string;
  /** URL-safe slug used for the detail route. */
  slug: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  /** Original article URL — where "Read original →" points. */
  url: string;
  /** Canonicalized URL (tracking params stripped) used for dedup. */
  canonicalUrl: string;
  author?: string | null;
  publishedAt: string; // ISO
  fetchedAt: string; // ISO
  /**
   * Short excerpt (<= ~50 words). We deliberately never store or render the
   * full copyrighted body — only enough to attribute and summarize.
   */
  excerpt: string;
  /** Our own AI/extractive summary. Always labeled as generated. */
  summary: string;
  /** Whether `summary` came from the LLM (true) or the extractive fallback. */
  summaryIsAI: boolean;
  category: Category;
  tags: string[];
  imageUrl?: string | null;
  readMinutes: number;
  /** Hash of normalized title+url; unique key for dedup. */
  contentHash: string;
}

export interface Cve {
  id: string; // e.g. CVE-2021-44228
  description: string;
  cvssScore: number | null;
  severity: Severity;
  cvssVector?: string | null;
  published: string; // ISO
  lastModified: string; // ISO
  cwe: string[];
  references: { url: string; source?: string }[];
  cachedAt?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatarUrl?: string | null;
  /** Category subscriptions used for notifications. */
  subscribedCategories: Category[];
}

export interface Bookmark {
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface NewsletterSubscription {
  email: string;
  categories: Category[];
  confirmed: boolean;
  createdAt: string;
}

export type NotificationType = "new-articles" | "cve-alert" | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
}

export interface SearchResult {
  type: "article" | "cve";
  id: string;
  title: string;
  description: string;
  href: string;
  meta?: string;
  score: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
