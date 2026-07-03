import type { Cve, Severity } from "@/types";
import { env } from "@/lib/env";
import { getRepository } from "@/lib/repo";

const NVD_ENDPOINT = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const CVE_ID_RE = /^CVE-\d{4}-\d{4,}$/i;

/* eslint-disable @typescript-eslint/no-explicit-any */

function severityFromScore(score: number | null): Severity {
  if (score == null) return "NONE";
  if (score >= 9) return "CRITICAL";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

function mapNvd(entry: any): Cve {
  const cve = entry.cve ?? entry;
  const descriptions: any[] = cve.descriptions ?? [];
  const description =
    descriptions.find((d) => d.lang === "en")?.value ??
    descriptions[0]?.value ??
    "No description available.";

  const metrics = cve.metrics ?? {};
  const primary =
    metrics.cvssMetricV31?.[0] ??
    metrics.cvssMetricV30?.[0] ??
    metrics.cvssMetricV2?.[0];
  const cvssData = primary?.cvssData;
  const cvssScore: number | null = cvssData?.baseScore ?? null;
  const severity: Severity =
    (cvssData?.baseSeverity as Severity | undefined) ??
    severityFromScore(cvssScore);

  const cwe: string[] = (cve.weaknesses ?? [])
    .flatMap((w: any) => w.description ?? [])
    .map((d: any) => d.value)
    .filter((v: string) => v && v.startsWith("CWE-"));

  const references = (cve.references ?? []).map((r: any) => ({
    url: r.url,
    source: r.source,
  }));

  return {
    id: cve.id,
    description,
    cvssScore,
    severity,
    cvssVector: cvssData?.vectorString ?? null,
    published: cve.published,
    lastModified: cve.lastModified,
    cwe: [...new Set(cwe)],
    references,
    cachedAt: new Date().toISOString(),
  };
}

async function nvdRequest(params: URLSearchParams): Promise<Cve[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${NVD_ENDPOINT}?${params.toString()}`, {
      headers: env.nvdKey ? { apiKey: env.nvdKey } : {},
      signal: controller.signal,
      // Cache upstream responses briefly to respect NVD rate limits.
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`NVD ${res.status}`);
    const json = await res.json();
    return (json.vulnerabilities ?? []).map(mapNvd);
  } catch (err) {
    console.warn("[nvd] request failed:", (err as Error).message);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Search CVEs live via NVD (keyword, or exact id when the query is a CVE id).
 * Caches results in the repository and falls back to the cache when NVD is
 * unreachable so the Explorer still works offline.
 */
export async function searchCves(query: string, limit = 20): Promise<Cve[]> {
  const q = query.trim();
  const repo = getRepository();

  const params = new URLSearchParams({ resultsPerPage: String(Math.min(limit, 50)) });
  if (CVE_ID_RE.test(q)) params.set("cveId", q.toUpperCase());
  else if (q) params.set("keywordSearch", q);
  else params.set("resultsPerPage", String(Math.min(limit, 20)));

  const live = await nvdRequest(params);
  if (live.length > 0) {
    await repo.upsertCves(live);
    return live.slice(0, limit);
  }
  // Offline / empty → cached + seeded data.
  return repo.searchCves(q, limit);
}

/** Fetch a single CVE by id: repo cache first (offline-friendly), then NVD. */
export async function getCveDetail(id: string): Promise<Cve | null> {
  const repo = getRepository();
  const cached = await repo.getCve(id);
  if (cached) return cached;

  const params = new URLSearchParams({ cveId: id.toUpperCase() });
  const live = await nvdRequest(params);
  if (live[0]) {
    await repo.upsertCves([live[0]]);
    return live[0];
  }
  return null;
}
