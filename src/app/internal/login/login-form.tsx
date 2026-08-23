"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="nama@gank.id"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        <LogIn className="h-4 w-4" />
        {pending ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
