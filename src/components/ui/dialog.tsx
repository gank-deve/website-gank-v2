"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl",
          className,
        )}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {title && (
          <h2 className="font-heading pr-8 text-xl font-semibold">{title}</h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        <div className={cn(title && "mt-5")}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
