import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export function ComingSoon({
  title,
  eyebrow,
  description,
  features,
}: {
  title: string;
  eyebrow: string;
  description: string;
  features: string[];
}) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={description} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-neon/40 bg-neon/10 text-neon shadow-neon">
            <Construction className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-xl font-bold">Under construction</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            This module is on the roadmap. The platform architecture already
            reserves its data models and routes — it will slot in without
            restructuring.
          </p>

          <ul className="mx-auto mt-8 grid max-w-md gap-2 text-left">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-4 py-2.5 text-sm text-fg/90"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neon" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-1 text-sm text-muted hover:text-neon"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
