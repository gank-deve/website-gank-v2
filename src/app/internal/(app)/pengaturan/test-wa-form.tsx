"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { testWhatsApp, type TestWaState } from "@/lib/actions/settings";

const initialState: TestWaState = {};

export function TestWaForm() {
  const [state, action, pending] = useActionState(testWhatsApp, initialState);

  return (
    <form action={action} className="space-y-3">
      <div>
        <p className="mb-1.5 text-sm font-medium">Tes Kirim Cepat</p>
        <p className="mb-2 text-xs text-muted-foreground">
          Mengirim template bawaan Meta (<code className="rounded bg-surface-muted px-1 py-0.5">hello_world</code>)
          untuk memverifikasi kredensial — tidak butuh template kustom approved.
          Nomor tujuan harus terdaftar di penerima mode development.
        </p>
        <div className="flex gap-2">
          <Input
            name="test_number"
            placeholder="081234567890"
            inputMode="tel"
            className="max-w-56"
            autoComplete="off"
          />
          <Button type="submit" variant="secondary" disabled={pending}>
            <Send className="h-4 w-4" />
            {pending ? "Mengirim..." : "Kirim Tes"}
          </Button>
        </div>
      </div>

      {state.message && (
        <p
          className={`rounded-lg border px-3 py-2 text-xs ${
            state.ok
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {state.ok ? "✓ " : "✗ "}
          {state.message}
        </p>
      )}
    </form>
  );
}
