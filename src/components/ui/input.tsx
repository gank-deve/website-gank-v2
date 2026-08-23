import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-10 w-full cursor-pointer rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground transition-colors outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 [&>option]:bg-surface [&>option]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
