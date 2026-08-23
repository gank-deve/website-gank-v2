"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, type PasswordState } from "@/lib/actions/settings";

const initialState: PasswordState = {};

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialState);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new_password" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Password Baru
          </label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
          />
        </div>
        <div>
          <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Ulangi Password Baru
          </label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Ulangi password"
          />
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
          {state.message}
        </p>
      )}

      <Button type="submit" variant="secondary" disabled={pending}>
        <KeyRound className="h-4 w-4" />
        {pending ? "Menyimpan..." : "Simpan Password Baru"}
      </Button>
    </form>
  );
}
