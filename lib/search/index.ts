import type { SearchResult } from "@/types";
import { getRepository } from "@/lib/repo";

/**
 * Unified search across articles + CVEs. Uses the repository for both (cached/
 * seeded CVE data) to stay fast for interactive use; the dedicated CVE Explorer
 * hits NVD live. Results are interleaved by score.
 */
export async function unifiedSearch(
  query: string,
  limit = 20
): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const repo = getRepository();

  const [articles, cves] = await Promise.all([
    repo.searchArticles(q, limit),
    repo.searchCves(q, Math.ceil(limit / 2)),
  ]);

  const results: SearchResult[] = [];

  articles.forEach((a, i) => {
    results.push({
      type: "article",
      id: a.id,
      title: a.title,
      description: a.summary,
      href: `/news/${a.slug}`,
      meta: `${a.sourceName} · ${a.category}`,
      score: 100 - i,
    });
  });

  cves.forEach((c, i) => {
    results.push({
      type: "cve",
      id: c.id,
      title: c.id,
      description: c.description,
      href: `/cve/${c.id}`,
      meta: `${c.severity}${c.cvssScore != null ? ` · CVSS ${c.cvssScore}` : ""}`,
      score: 90 - i,
    });
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
