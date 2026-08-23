import { cn } from "@/lib/utils";

type Tone = "accent" | "info" | "warning" | "success" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent border-accent/30",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  success: "bg-success/10 text-success border-success/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  neutral: "bg-surface-muted text-muted-foreground border-border-subtle",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
