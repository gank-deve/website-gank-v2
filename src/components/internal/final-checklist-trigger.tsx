"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChecklistModal } from "@/components/internal/checklist-modal";

export default function FinalChecklistTrigger({
  orderId,
  disabled,
  label = "Buka Checklist Akhir",
}: {
  orderId: string;
  disabled?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <ClipboardList className="h-4 w-4" />
        {label}
      </Button>

      {open && (
        <ChecklistModal
          open
          orderId={orderId}
          phase="akhir"
          onClose={() => setOpen(false)}
          onDone={() => router.refresh()}
        />
      )}
    </>
  );
}
