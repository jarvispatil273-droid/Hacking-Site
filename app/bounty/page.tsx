import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Bug Bounty",
  description: "Curated bug bounty programs and responsible disclosure guidance.",
  path: "/bounty",
});

export default function BountyPage() {
  return (
    <ComingSoon
      eyebrow="Responsible disclosure"
      title="Bug Bounty Hub"
      description="Discover active programs, track scope changes, and learn responsible disclosure best practices."
      features={[
        "Aggregated programs with scope and payout ranges",
        "Disclosure timelines and policy summaries",
        "Reconnaissance and reporting checklists",
        "Bookmark programs to your console",
      ]}
    />
  );
}
