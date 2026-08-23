import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getWhatsAppConfigStatus } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestWaForm } from "./test-wa-form";
import { ChangePasswordForm } from "./change-password-form";
import {
  MessageCircle,
  CircleCheck,
  CircleX,
  ExternalLink,
  Database,
  KeyRound,
} from "lucide-react";

export const metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  const wa = getWhatsAppConfigStatus();
  const supabaseOk = hasSupabaseEnv();

  const checks = [
    {
      label: "WHATSAPP_ENABLED",
      value: wa.enabled ? "true" : "false (notifikasi dilewati)",
      ok: wa.enabled,
    },
    {
      label: "WHATSAPP_PHONE_NUMBER_ID",
      value: wa.phoneNumberIdSet ? "terisi" : "belum diisi",
      ok: wa.phoneNumberIdSet,
    },
    {
      label: "WHATSAPP_ACCESS_TOKEN",
      value: wa.accessTokenSet ? "terisi" : "belum diisi",
      ok: wa.accessTokenSet,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Akun dan status konfigurasi layanan eksternal.
        </p>
      </div>

      {/* Akun */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-accent" />
            Ubah Password
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Login sebagai <span className="text-foreground">{user.email}</span> ({user.role})
          </p>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Supabase */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-accent" />
              Supabase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supabaseOk ? (
              <Badge tone="success">
                <CircleCheck className="h-3.5 w-3.5" /> Terhubung
              </Badge>
            ) : (
              <Badge tone="danger">
                <CircleX className="h-3.5 w-3.5" /> Belum dikonfigurasi
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* WhatsApp — admin saja */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              Notifikasi WhatsApp
            </CardTitle>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              Panduan setup lengkap:{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5">
                docs/PANDUAN-WHATSAPP.md
              </code>
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 cursor-pointer text-accent hover:underline"
              >
                Dashboard Meta
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center justify-between gap-3 text-sm">
                  <code className="rounded bg-surface-muted px-2 py-0.5 text-xs">{c.label}</code>
                  {c.ok ? (
                    <Badge tone="success">
                      <CircleCheck className="h-3.5 w-3.5" /> {c.value}
                    </Badge>
                  ) : (
                    <Badge tone="warning">{c.value}</Badge>
                  )}
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  Template status / selesai
                </span>
                <span className="font-mono text-xs">
                  {wa.templateStatus} · {wa.templateDone}
                </span>
              </li>
            </ul>

            <div className="border-t border-border-subtle pt-4">
              <TestWaForm />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
