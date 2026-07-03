import Parser from "rss-parser";

export interface RawFeedItem {
  title: string;
  link: string;
  isoDate?: string;
  creator?: string;
  contentSnippet?: string;
  imageUrl: string | null;
}

type CustomFeed = { title?: string };
type CustomItem = {
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
  enclosure?: { url?: string };
};

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  timeout: 15000,
  headers: {
    // Identify ourselves honestly and respectfully to publishers.
    "User-Agent":
      "AEGIS-CyberAggregator/0.1 (+https://github.com/; ethical RSS summarizer)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
});

function pickImage(item: Parser.Item & CustomItem): string | null {
  return (
    item["media:content"]?.$?.url ??
    item["media:thumbnail"]?.$?.url ??
    item.enclosure?.url ??
    null
  );
}

/** Fetch and normalize a single RSS/Atom feed. Never throws — returns [] on error. */
export async function fetchFeed(feedUrl: string): Promise<RawFeedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items ?? [])
      .filter((it) => it.title && it.link)
      .map((it) => ({
        title: it.title!.trim(),
        link: it.link!.trim(),
        isoDate: it.isoDate,
        creator: (it as { creator?: string }).creator,
        contentSnippet: it.contentSnippet ?? it.content ?? "",
        imageUrl: pickImage(it),
      }));
  } catch (err) {
    console.warn(`[rss] failed to fetch ${feedUrl}:`, (err as Error).message);
    return [];
  }
}
