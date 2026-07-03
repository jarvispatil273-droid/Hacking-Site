import Link from "next/link";
import { CATEGORIES, type Category } from "@/types";
import { cn } from "@/lib/utils/cn";

/** Server-rendered category pills; active state driven by the URL query. */
export function CategoryFilter({
  active,
  basePath = "/news",
}: {
  active?: Category;
  basePath?: string;
}) {
  const pill = (label: string, href: string, isActive: boolean) => (
    <Link
      key={label}
      href={href}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        isActive
          ? "border-neon/60 bg-neon/15 text-neon shadow-neon"
          : "border-border text-muted hover:border-neon/40 hover:text-fg"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {pill("All", basePath, !active)}
      {CATEGORIES.map((c) =>
        pill(c, `${basePath}?category=${encodeURIComponent(c)}`, active === c)
      )}
    </div>
  );
}
