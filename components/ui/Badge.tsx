import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-neon",
        glow && "shadow-neon",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="chip">#{children}</span>;
}
