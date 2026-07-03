import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-mono font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/70 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-neon/15 text-neon border border-neon/50 hover:bg-neon/25 hover:shadow-neon",
  outline:
    "border border-border text-fg hover:border-neon/60 hover:text-neon hover:shadow-neon",
  ghost: "text-muted hover:text-fg hover:bg-surface-2/60",
  danger:
    "bg-danger/15 text-danger border border-danger/50 hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Shared class string so <Link> can look like a button too. */
export function buttonVariants(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants(variant, size), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
