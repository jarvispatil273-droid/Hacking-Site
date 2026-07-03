import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/metadata";
import { getRepository } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const staticRoutes = ["", "/news", "/cve", "/search", "/dashboard"].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: p === "" ? 1 : 0.8,
    })
  );

  try {
    const { items } = await getRepository().listArticles({ pageSize: 200 });
    const articleRoutes = items.map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: new Date(a.fetchedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
