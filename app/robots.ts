import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
