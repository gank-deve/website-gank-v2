"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOrderCosts } from "@/lib/actions/orders";

export function CostsForm({
  orderId,
  estimated,
  final,
}: {
  orderId: string;
  estimated: number;
  final: number | null;
}) {
  const router = useRouter();
  const [estimatedCost, setEstimated] = useState(
    estimated ? String(estimated) : "",
  );
  const [finalCost, setFinal] = useState(final !== null ? String(final) : "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Estimasi (Rp)
          </label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={estimatedCost}
            onChange={(e) => {
              setEstimated(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Biaya Akhir (Rp)
          </label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={finalCost}
            onChange={(e) => {
              setFinal(e.target.value);
              setSaved(false);
            }}
            placeholder="Saat selesai"
          />
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await updateOrderCosts(
            orderId,
            Number(estimatedCost) || 0,
            finalCost === "" ? null : Number(finalCost),
          );
          setPending(false);
          setSaved(true);
          router.refresh();
        }}
      >
        {saved ? "Tersimpan" : pending ? "Menyimpan..." : "Simpan Biaya"}
      </Button>
    </div>
  );
}
