/**
 * Near-duplicate detection for headlines. Exact dedup is handled by contentHash
 * / canonicalUrl in the repository; this catches the same story republished with
 * slightly different titles, using character-trigram Jaccard similarity.
 */

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trigrams(text: string): Set<string> {
  const s = ` ${normalizeTitle(text)} `;
  const grams = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) grams.add(s.slice(i, i + 3));
  return grams;
}

export function titleSimilarity(a: string, b: string): number {
  const ga = trigrams(a);
  const gb = trigrams(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let inter = 0;
  for (const g of ga) if (gb.has(g)) inter++;
  const union = ga.size + gb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** True if `title` is ~the same story as any already-seen title. */
export function isNearDuplicate(
  title: string,
  seen: string[],
  threshold = 0.72
): boolean {
  return seen.some((s) => titleSimilarity(title, s) >= threshold);
}
