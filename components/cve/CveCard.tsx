import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Cve } from "@/types";
import { SeverityBadge } from "@/components/ui/Severity";
import { formatDate } from "@/lib/utils/dates";

export function CveCard({ cve }: { cve: Cve }) {
  return (
    <Link
      href={`/cve/${cve.id}`}
      className="card card-hover group block p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-fg group-hover:text-neon">
          {cve.id}
        </span>
        <SeverityBadge severity={cve.severity} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-muted">{cve.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="font-mono text-neon">
            CVSS {cve.cvssScore?.toFixed(1) ?? "—"}
          </span>
          {cve.cwe[0] && <span className="chip">{cve.cwe[0]}</span>}
        </div>
        <span className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          Details <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
      <p className="mt-2 text-[11px] text-muted/70">
        Published {formatDate(cve.published)}
      </p>
    </Link>
  );
}
