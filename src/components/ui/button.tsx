import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm shadow-accent/20",
  secondary:
    "bg-surface-muted text-foreground hover:bg-border-subtle border border-border-subtle",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-muted",
  danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30",
  outline:
    "border border-accent/40 text-accent hover:bg-accent-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-9 w-9 p-0",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
