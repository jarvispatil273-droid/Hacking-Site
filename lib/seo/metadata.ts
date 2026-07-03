import type { Metadata } from "next";
import { env } from "@/lib/env";

export const SITE = {
  name: "AEGIS",
  title: "AEGIS — AI Cybersecurity Intelligence",
  description:
    "AI-summarized cybersecurity news, a live CVE explorer, and unified threat search. Every source is attributed and linked — never republished.",
  url: env.siteUrl,
} as const;

/** Build per-page metadata with sensible OpenGraph/Twitter defaults. */
export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const title = opts.title ? `${opts.title} · ${SITE.name}` : SITE.title;
  const description = opts.description ?? SITE.description;
  const url = opts.path ? `${SITE.url}${opts.path}` : SITE.url;

  return {
    title,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
