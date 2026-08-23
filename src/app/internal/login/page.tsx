import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/internal/setup-notice";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Login Internal" };

export default async function LoginPage() {
  if (hasSupabaseEnv()) {
    const user = await getCurrentUser();
    if (user) redirect("/internal");
  }

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-16 text-zinc-100">
      <div
        aria-hidden
        className="absolute top-1/3 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,black,transparent)]"
      />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="font-heading block text-center text-3xl font-bold tracking-tight text-white"
        >
          GANK<span className="text-blue-500">.</span>
        </Link>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs tracking-widest text-zinc-500 uppercase">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
          Sistem Internal
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-7 backdrop-blur">
          {!hasSupabaseEnv() ? (
            <SetupNotice />
          ) : (
            <LoginForm />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Area terbatas untuk karyawan GANK. —{" "}
          <Link href="/" className="transition-colors hover:text-zinc-400">
            kembali ke situs utama
          </Link>
        </p>
      </div>
    </div>
  );
}
