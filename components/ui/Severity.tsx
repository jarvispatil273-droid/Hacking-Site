import { cn } from "@/lib/utils/cn";
import type { Severity } from "@/types";

const STYLES: Record<Severity, string> = {
  CRITICAL: "border-red-500/50 bg-red-500/15 text-red-400",
  HIGH: "border-orange-500/50 bg-orange-500/15 text-orange-400",
  MEDIUM: "border-yellow-500/50 bg-yellow-500/15 text-yellow-300",
  LOW: "border-sky-500/50 bg-sky-500/15 text-sky-300",
  NONE: "border-zinc-600/50 bg-zinc-600/15 text-zinc-400",
};

const BAR: Record<Severity, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-sky-400",
  NONE: "bg-zinc-500",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        STYLES[severity],
        className
      )}
    >
      {severity}
    </span>
  );
}

/** Horizontal CVSS score meter (0–10). */
export function CvssMeter({
  score,
  severity,
}: {
  score: number | null;
  severity: Severity;
}) {
  const pct = Math.max(0, Math.min(100, ((score ?? 0) / 10) * 100));
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-muted">
          CVSS Base Score
        </span>
        <span className="font-mono text-2xl font-bold text-fg">
          {score != null ? score.toFixed(1) : "N/A"}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full transition-all", BAR[severity])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
