import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Long-form security analysis and aggregated blog highlights.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <ComingSoon
      eyebrow="Deep dives"
      title="Blog & Analysis"
      description="Aggregated highlights from leading security blogs plus original long-form analysis — always attributed and linked."
      features={[
        "Curated highlights from research blogs",
        "Original explainers and threat breakdowns",
        "Reading-time estimates and topic tags",
        "Full-text search integration",
      ]}
    />
  );
}
