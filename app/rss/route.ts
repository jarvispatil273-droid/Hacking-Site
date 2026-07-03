import { getRepository } from "@/lib/repo";
import { SITE } from "@/lib/seo/metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * AEGIS's own RSS feed of AI summaries. Each item links back to BOTH our detail
 * page and the original source — we syndicate our summaries, never the original
 * copyrighted bodies.
 */
export async function GET() {
  const base = SITE.url.replace(/\/$/, "");
  const { items } = await getRepository().listArticles({ pageSize: 40 });

  const entries = items
    .map((a) => {
      const link = `${base}/news/${a.slug}`;
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(a.category)}</category>
      <source url="${escapeXml(a.url)}">${escapeXml(a.sourceName)}</source>
      <description>${escapeXml(a.summary)} (Summary by AEGIS. Read the original at ${escapeXml(a.sourceName)}: ${escapeXml(a.url)})</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.name)} — AI Cybersecurity Summaries</title>
    <link>${base}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
${entries}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate",
    },
  });
}
