"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChecklistModal } from "@/components/internal/checklist-modal";
import {
  nextStatus,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/constants";
import { updateOrderStatus, retryNotification } from "@/lib/actions/orders";

export function StatusActions({
  orderId,
  currentStatus,
  finalChecklistComplete,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  finalChecklistComplete: boolean;
}) {
  const router = useRouter();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const next = nextStatus(currentStatus);
  if (!next) return null;

  const advance = async () => {
    setPending(true);
    setError(undefined);
    const result = await updateOrderStatus(orderId, next);
    setPending(false);

    if (result.error) {
      // Gate server-side terpicu — tampilkan modal checklist akhir
      if (next === "selesai") {
        setChecklistOpen(true);
      }
      setError(result.error);
      return;
    }
    router.refresh();
  };

  const handleClick = () => {
    if (next === "selesai" && !finalChecklistComplete) {
      setChecklistOpen(true);
      return;
    }
    advance();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleClick} disabled={pending}>
          Lanjut ke {ORDER_STATUS_LABEL[next]}
          <ArrowRight className="h-4 w-4" />
        </Button>

        {next === "selesai" && !finalChecklistComplete && (
          <span className="inline-flex items-center gap-1.5 text-xs text-warning">
            <ShieldAlert className="h-3.5 w-3.5" />
            Checklist fungsional akhir wajib diisi dulu
          </span>
        )}
      </div>

      {error && !checklistOpen && (
        <p className="mt-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      {checklistOpen && (
        <ChecklistModal
          open
          orderId={orderId}
          phase="akhir"
          onClose={() => setChecklistOpen(false)}
          onDone={() => {
            // Setelah checklist lengkap, langsung lanjut ke selesai
            advance();
          }}
        />
      )}
    </>
  );
}

export function RetryNotificationButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await retryNotification(orderId);
        setPending(false);
        router.refresh();
      }}
    >
      <RefreshCw className={pending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
      Kirim Ulang Notifikasi
    </Button>
  );
}
