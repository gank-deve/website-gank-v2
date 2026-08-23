import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatusActions,
  RetryNotificationButton,
} from "@/components/internal/order-actions";
import { CostsForm } from "@/components/internal/costs-form";
import FinalChecklistTrigger from "@/components/internal/final-checklist-trigger";
import {
  CHECKLIST_ITEMS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_TONE,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, CircleCheck, CircleX, MinusCircle } from "lucide-react";

export const metadata = { title: "Detail Order Servis" };

export default async function OrderDetailPage({
  params,
}: PageProps<"/internal/servis/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: checklists }, { data: history }, { data: logs }] =
    await Promise.all([
      supabase.from("service_orders").select("*").eq("id", id).single(),
      supabase
        .from("service_checklists")
        .select("phase, item_key, passed, note, checked_at")
        .eq("order_id", id),
      supabase
        .from("order_status_history")
        .select("status, note, created_at")
        .eq("order_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("notification_logs")
        .select("template, status, error, created_at, destination")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (!order) notFound();

  let damageTypeName: string | null = null;
  if (order.damage_type_id) {
    const { data: dt } = await supabase
      .from("damage_types")
      .select("name")
      .eq("id", order.damage_type_id)
      .single();
    damageTypeName = dt?.name ?? null;
  }

  const checklistMap = new Map(checklists?.map((c) => [`${c.phase}:${c.item_key}`, c]));
  const finalCount = checklists?.filter((c) => c.phase === "akhir").length ?? 0;
  const finalComplete = finalCount >= CHECKLIST_ITEMS.length;
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status as OrderStatus);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/internal/servis"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua order
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold tracking-widest text-accent">
            {order.code}
          </p>
          <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight">
            {order.device_brand ? `${order.device_brand} ` : ""}
            {order.device_model}
          </h1>
        </div>
        <Badge tone={ORDER_STATUS_TONE[order.status as OrderStatus] ?? "neutral"} className="px-3 py-1 text-sm">
          {ORDER_STATUS_LABEL[order.status as OrderStatus]}
        </Badge>
      </div>

      {/* Stepper */}
      {order.status !== "batal" && (
        <Card>
          <CardContent>
            <ol className="grid grid-flow-col auto-cols-fr">
              {ORDER_STATUS_FLOW.map((status, i) => (
                <li key={status} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                      i <= currentIdx
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border-subtle bg-surface text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "mt-2 w-full px-1 text-[11px] leading-tight",
                      i <= currentIdx ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {ORDER_STATUS_LABEL[status]}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Aksi status (gate checklist akhir ada di sini) */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          {order.status === "selesai" && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
              <CircleCheck className="h-3.5 w-3.5" />
              Checklist akhir lengkap ({finalCount}/{CHECKLIST_ITEMS.length}) — hasil servis terjamin konsisten.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusActions
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
            finalChecklistComplete={finalComplete}
          />

          <div className="border-t border-border-subtle pt-4">
            <CostsForm
              orderId={order.id}
              estimated={Number(order.estimated_cost)}
              final={order.final_cost !== null ? Number(order.final_cost) : null}
            />
          </div>

          {/* Edit manual checklist akhir bila sudah lengkap */}
          <FinalChecklistTrigger
            orderId={order.id}
            disabled={!finalComplete && currentIdx < ORDER_STATUS_FLOW.indexOf("proses")}
            label={finalComplete ? "Edit Checklist Akhir" : "Buka Checklist Akhir"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Info pelanggan & perangkat */}
        <Card>
          <CardHeader><CardTitle>Pelanggan & Perangkat</CardTitle></CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            {[
              ["Nama", order.customer_name],
              ["WhatsApp", order.customer_phone],
              ["Perangkat", `${order.device_brand || "-"} ${order.device_model}`],
              ["IMEI", order.imei || "-"],
              ["Jenis Kerusakan", damageTypeName ?? "-"],
              ["Keluhan", order.complaint || "-"],
              ["Masuk", formatDate(order.created_at)],
              ["Selesai", order.completed_at ? formatDate(order.completed_at) : "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
                <span className="min-w-0 break-words">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Riwayat + notifikasi */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Riwayat Status</CardTitle></CardHeader>
            <CardContent>
              {(history ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
              ) : (
                <ul className="space-y-3">
                  {(history ?? []).map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <div>
                        <p className="font-medium">{ORDER_STATUS_LABEL[h.status as OrderStatus] ?? h.status}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(h.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifikasi WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(logs ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada pengiriman.</p>
              ) : (
                <ul className="space-y-2">
                  {(logs ?? []).map((log, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {formatDate(log.created_at)} · ke {log.destination}
                      </span>
                      <Badge tone={log.status === "sent" ? "success" : log.status === "failed" ? "danger" : "neutral"}>
                        {log.status === "sent" ? "Terkirim" : log.status === "failed" ? "Gagal" : "Dilewati"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              {(logs ?? []).some((l) => l.status !== "sent") && (
                <RetryNotificationButton orderId={order.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Perbandingan checklist awal vs akhir */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Fungsional — Awal vs Akhir</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Jaminan konsistensi: kondisi akhir dibandingkan langsung dengan kondisi awal.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-2 pr-4 font-medium">Komponen</th>
                <th className="py-2 pr-4 font-medium">Awal</th>
                <th className="py-2 pr-4 font-medium">Akhir</th>
                <th className="py-2 font-medium">Catatan Akhir</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLIST_ITEMS.map((item) => {
                const awal = checklistMap.get(`awal:${item.key}`);
                const akhir = checklistMap.get(`akhir:${item.key}`);
                return (
                  <tr key={item.key} className="border-b border-border-subtle/50 last:border-0">
                    <td className="py-2.5 pr-4">{item.label}</td>
                    <td className="py-2.5 pr-4"><CheckMark entry={awal} /></td>
                    <td className="py-2.5 pr-4"><CheckMark entry={akhir} /></td>
                    <td className="max-w-56 truncate py-2.5 text-xs text-muted-foreground" title={akhir?.note}>
                      {akhir?.note || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!finalComplete && (
            <p className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              Checklist akhir baru terisi {finalCount}/{CHECKLIST_ITEMS.length}. Servis tidak bisa ditandai selesai sebelum lengkap.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CheckMark({ entry }: { entry?: { passed: boolean; note: string } | null }) {
  if (!entry) return <MinusCircle className="h-4 w-4 text-muted-foreground/40" />;
  return entry.passed ? (
    <CircleCheck className="h-4 w-4 text-success" />
  ) : (
    <CircleX className="h-4 w-4 text-danger" />
  );
}
