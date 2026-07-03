import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Learning",
  description: "Structured cybersecurity learning paths and curated resources.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <ComingSoon
      eyebrow="Level up"
      title="Learning Resources"
      description="Structured paths from fundamentals to specialization, with curated, vetted external resources."
      features={[
        "Guided tracks: web, network, cloud, malware, blue team",
        "Curated labs, videos and reading lists (all attributed)",
        "Progress tracking tied to your console",
        "Glossary linked from news and CVE pages",
      ]}
    />
  );
}
