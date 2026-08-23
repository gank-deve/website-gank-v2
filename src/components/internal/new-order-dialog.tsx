"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Plus, ClipboardCheck, Copy } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { ChecklistModal } from "@/components/internal/checklist-modal";
import {
  createOrder,
  type OrderFormState,
} from "@/lib/actions/orders";

const initialState: OrderFormState = {};

interface DamageType {
  id: number;
  name: string;
}

export function NewOrderDialog({ damageTypes }: { damageTypes: DamageType[] }) {
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setAttempt((a) => a + 1);
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        Order Baru
      </Button>

      {/* key={attempt} memastikan state form/checklist selalu bersih per sesi */}
      {open && (
        <NewOrderFlow key={attempt} damageTypes={damageTypes} onFinished={() => setOpen(false)} />
      )}
    </>
  );
}

function NewOrderFlow({
  damageTypes,
  onFinished,
}: {
  damageTypes: DamageType[];
  onFinished: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createOrder, initialState);
  // 'form' -> 'checklist' (popup otomatis) -> 'done'
  const [phase, setPhase] = useState<"form" | "checklist" | "done">("form");
  const [checklistSaved, setChecklistSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const closeAll = () => {
    onFinished();
    router.refresh();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // clipboard tidak tersedia
    }
  };

  return (
    <>
      <Dialog
        open={!state.created}
        onClose={() => !pending && onFinished()}
        title="Buat Order Servis"
        description="Isi data pelanggan dan perangkat. Setelah order dibuat, checklist fungsional awal akan muncul otomatis."
      >
        <form action={action} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="customer_name" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Nama Pelanggan *
              </label>
              <Input id="customer_name" name="customer_name" required placeholder="Nama" />
            </div>
            <div>
              <label htmlFor="customer_phone" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                No. WhatsApp *
              </label>
              <Input id="customer_phone" name="customer_phone" required placeholder="081234567890" inputMode="tel" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="device_brand" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Brand HP
              </label>
              <Input id="device_brand" name="device_brand" placeholder="Samsung / iPhone / ..." />
            </div>
            <div>
              <label htmlFor="device_model" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Tipe HP *
              </label>
              <Input id="device_model" name="device_model" required placeholder="Galaxy A54 5G" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="damage_type_id" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Jenis Kerusakan
              </label>
              <Select id="damage_type_id" name="damage_type_id" defaultValue="">
                <option value="">— Pilih —</option>
                {damageTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="estimated_cost" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Estimasi Biaya (Rp)
              </label>
              <Input id="estimated_cost" name="estimated_cost" type="number" min={0} step={1000} placeholder="0" inputMode="numeric" />
            </div>
          </div>

          <div>
            <label htmlFor="imei" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
              IMEI (opsional)
            </label>
            <Input id="imei" name="imei" placeholder="15 digit" inputMode="numeric" />
          </div>

          <div>
            <label htmlFor="complaint" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Keluhan Pelanggan
            </label>
            <Textarea id="complaint" name="complaint" placeholder="Ceritakan keluhan..." rows={2} />
          </div>

          {state.error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onFinished}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Membuat..." : "Buat Order"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Popup checklist fungsional awal — muncul otomatis saat order berhasil dibuat */}
      {state.created && (
        <>
          {phase !== "done" ? (
            <ChecklistModal
              open
              orderId={state.created.id}
              phase="awal"
              onDone={() => setChecklistSaved(true)}
              onClose={() => setPhase("done")}
            />
          ) : (
            <Dialog open onClose={closeAll}>
              <div className="py-2 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
                  <ClipboardCheck className="h-7 w-7 text-accent" />
                </span>
                <h2 className="font-heading mt-4 text-xl font-semibold">Order Siap!</h2>
                {checklistSaved ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Checklist awal tersimpan & pelanggan mendapat notifikasi WhatsApp.
                  </p>
                ) : (
                  <p className="mx-auto mt-1 max-w-xs rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                    Checklist fungsional awal belum diisi. Isi sekarang atau buka dari detail order sebelum mengerjakan.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => copyCode(state.created!.code)}
                  className="font-heading mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-accent/40 bg-accent-soft px-5 py-2.5 font-mono text-lg font-bold tracking-wider text-accent transition-colors hover:border-accent"
                  title="Klik untuk salin kode"
                >
                  {state.created.code}
                  <Copy className="h-4 w-4 opacity-60" />
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  {copied ? "Kode tersalin!" : "Serahkan kode ini ke pelanggan untuk lacak servis"}
                </p>
                {!checklistSaved && (
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => setPhase("checklist")}
                  >
                    Isi Checklist Sekarang
                  </Button>
                )}
                <Button onClick={closeAll} className={checklistSaved ? "mt-6 w-full" : "mt-3 w-full"}>
                  Selesai
                </Button>
              </div>
            </Dialog>
          )}
        </>
      )}
    </>
  );
}
