"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChecklistRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-lg border px-3.5 py-3 text-left text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-success/40 bg-success/10 text-foreground"
          : "border-border-subtle bg-background hover:bg-surface-muted",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked ? "border-success bg-success text-white" : "border-border-subtle",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
