import { Database, ExternalLink } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function SetupNotice() {
  if (hasSupabaseEnv()) return null;

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-warning/30 bg-warning/5 p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10">
        <Database className="h-5 w-5 text-warning" />
      </span>
      <h2 className="font-heading mt-4 text-lg font-semibold">
        Supabase Belum Terhubung
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
        <li>Buat project di supabase.com</li>
        <li>
          Jalankan <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">supabase/migration.sql</code> di SQL Editor
        </li>
        <li>
          Isi <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">.env.local</code> dari{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">.env.example</code>, lalu restart server
        </li>
      </ol>
      <a
        href="https://supabase.com/dashboard/project/_/settings/api"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        Ambil URL &amp; API Key
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
