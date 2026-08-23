"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, EyeOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setListingStatus } from "@/lib/actions/listings";

export function ListingRowActions({
  id,
  status,
}: {
  id: string;
  status: "available" | "sold" | "hidden";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: "available" | "sold" | "hidden") =>
    startTransition(async () => {
      await setListingStatus(id, next);
      router.refresh();
    });

  if (status === "available") {
    return (
      <div className="flex justify-end gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          title="Tandai terjual"
          onClick={() => change("sold")}
        >
          <Check className="h-3.5 w-3.5" />
          Terjual
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          title="Sembunyikan dari katalog"
          onClick={() => change("hidden")}
        >
          <EyeOff className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        title="Jual kembali / tampilkan"
        onClick={() => change("available")}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Aktifkan
      </Button>
    </div>
  );
}
