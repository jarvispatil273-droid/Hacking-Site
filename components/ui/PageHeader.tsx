export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/70 bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {eyebrow && (
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-neon/80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
