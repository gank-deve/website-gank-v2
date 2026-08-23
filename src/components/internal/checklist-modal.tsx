"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChecklistRow } from "@/components/ui/checklist-row";
import { CHECKLIST_ITEMS, type ChecklistPhase } from "@/lib/constants";
import { saveChecklist, type ChecklistEntryInput } from "@/lib/actions/orders";

export interface ChecklistEntry {
  passed: boolean;
  note: string;
}

export function ChecklistModal({
  open,
  onClose,
  orderId,
  phase,
  initialEntries = {},
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  phase: ChecklistPhase;
  initialEntries?: Record<string, ChecklistEntry>;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [entries, setEntries] =
    useState<Record<string, ChecklistEntry>>(initialEntries);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const filled = Object.keys(entries).length;
  const isFinal = phase === "akhir";
  const canSave = isFinal ? filled === CHECKLIST_ITEMS.length : filled > 0;

  const toggle = (key: string, passed: boolean) => {
    setEntries((prev) => ({
      ...prev,
      [key]: { passed, note: prev[key]?.note ?? "" },
    }));
  };

  const setNote = (key: string, note: string) => {
    setEntries((prev) => ({
      ...prev,
      [key]: { passed: prev[key]?.passed ?? false, note },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(undefined);
    const payload: ChecklistEntryInput[] = Object.entries(entries).map(
      ([item_key, e]) => ({ item_key, passed: e.passed, note: e.note }),
    );
    const result = await saveChecklist(orderId, phase, payload);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        isFinal
          ? "Checklist Fungsional Akhir"
          : "Checklist Fungsional Awal"
      }
      description={
        isFinal
          ? "Wajib lengkap sebelum servis bisa ditandai SELESAI — menjamin hasil konsisten dengan kondisi awal."
          : "Rekam kondisi semua fungsi HP saat pertama masuk. Ini menjadi pembanding saat pemeriksaan akhir."
      }
      className="max-w-xl"
    >
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => (
          <div key={item.key}>
            <ChecklistRow
              label={item.label}
              checked={entries[item.key]?.passed ?? false}
              onChange={(checked) => toggle(item.key, checked)}
            />
            {(isFinal || entries[item.key]) && (
              <Input
                value={entries[item.key]?.note ?? ""}
                onChange={(e) => setNote(item.key, e.target.value)}
                placeholder="Catatan (opsional)..."
                className="mt-1 h-8 text-xs"
              />
            )}
          </div>
        ))}
      </div>

      {isFinal && (
        <p className="mt-3 text-xs text-muted-foreground">
          Terisi: {filled}/{CHECKLIST_ITEMS.length} item
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? "Menyimpan..." : "Simpan Checklist"}
        </Button>
      </div>
    </Dialog>
  );
}
