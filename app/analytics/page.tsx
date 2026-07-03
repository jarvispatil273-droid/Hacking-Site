import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Analytics",
  description: "Trends across threats, categories, and sources over time.",
  path: "/analytics",
  noindex: true,
});

export default function AnalyticsPage() {
  return (
    <ComingSoon
      eyebrow="Signals"
      title="Threat Analytics"
      description="Visualize how threats trend over time — by category, source, severity and tag."
      features={[
        "Volume trends by category and source",
        "CVSS severity distribution over time",
        "Emerging-tag detection",
        "Exportable charts",
      ]}
    />
  );
}
