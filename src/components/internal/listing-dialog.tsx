"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import {
  createListing,
  type ListingFormState,
} from "@/lib/actions/listings";

const initialState: ListingFormState = {};

export function NewListingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Tambah Unit
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah HP Bekas"
        description="Unit akan langsung tampil di katalog publik dengan status tersedia."
      >
        <NewListingForm onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function NewListingForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createListing, initialState);

  if (state.success) {
    router.refresh();
    onDone?.();
    return null;
  }

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="brand" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Brand *</label>
          <Input id="brand" name="brand" required placeholder="iPhone / Samsung / ..." />
        </div>
        <div>
          <label htmlFor="model" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Model *</label>
          <Input id="model" name="model" required placeholder="13 Pro Max 256GB" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="storage" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Storage</label>
          <Input id="storage" name="storage" placeholder="256 GB" />
        </div>
        <div>
          <label htmlFor="ram" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">RAM</label>
          <Input id="ram" name="ram" placeholder="8 GB" />
        </div>
        <div>
          <label htmlFor="color" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Warna</label>
          <Input id="color" name="color" placeholder="Midnight" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="condition_grade" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Grade Kondisi</label>
          <Select id="condition_grade" name="condition_grade" defaultValue="baik">
            <option value="mulus">Mulus</option>
            <option value="baik">Baik</option>
            <option value="layak">Layak</option>
          </Select>
        </div>
        <div>
          <label htmlFor="price" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Harga (Rp) *</label>
          <Input id="price" name="price" type="number" min={0} step={1000} required placeholder="3500000" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">Deskripsi</label>
        <Textarea id="description" name="description" rows={2} placeholder="Kondisi unit, kelengkapan..." />
      </div>

      <input type="hidden" name="status" value="available" />

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={() => onDone?.()}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Unit"}
        </Button>
      </div>
    </form>
  );
}
