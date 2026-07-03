import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Admin",
  description: "Administer sources, ingestion, and content moderation.",
  path: "/admin",
  noindex: true,
});

export default function AdminPage() {
  return (
    <ComingSoon
      eyebrow="Operations"
      title="Admin Dashboard"
      description="Manage sources, trigger and monitor ingestion runs, and moderate categorization."
      features={[
        "Enable/disable and add RSS sources",
        "Manual ingestion triggers with run reports",
        "Re-categorize and merge duplicate stories",
        "Newsletter and subscriber management",
      ]}
    />
  );
}
