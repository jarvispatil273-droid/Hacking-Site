import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";
import projects from "@/data/seed/projects.json";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: "Security tools and modules built on the AEGIS platform.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Showcase"
        title="Projects"
        subtitle="Modules and tools that make up the AEGIS platform — some live, some on the roadmap."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="card card-hover group flex flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-fg group-hover:text-neon">
                  {p.name}
                </h3>
                <span
                  className={cn(
                    "chip",
                    p.status === "live" ? "text-neon" : "text-muted"
                  )}
                >
                  {p.status}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{p.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
