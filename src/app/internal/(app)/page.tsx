import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PerformanceChart, DamageDonut } from "@/components/internal/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Wrench,
  CheckCircle2,
  Banknote,
  AlertTriangle,
} from "lucide-react";

export const metadata = { title: "Dashboard Internal" };

const PERIODS = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
] as const;

export default async function DashboardPage({
  searchParams,
}: PageProps<"/internal">) {
  const params = await searchParams;
  const periodDays = ["7", "30", "90"].includes(params.p as string)
    ? Number(params.p)
    : 30;

  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - periodDays + 1);
  since.setHours(0, 0, 0, 0);

  const [ordersRes, damagesRes, failedNotifRes] = await Promise.all([
    supabase
      .from("service_orders")
      .select("status, created_at, completed_at, final_cost")
      .gte("created_at", since.toISOString()),
    supabase
      .from("damage_types")
      .select("id, name"),
    supabase
      .from("notification_logs")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since.toISOString()),
  ]);

  const orders = ordersRes.data ?? [];
  const damageTypes = damagesRes.data ?? [];

  // Ringkasan
  const activeOrders = orders.filter(
    (o) => !["diambil", "batal"].includes(o.status),
  ).length;
  const completedOrders = orders.filter((o) =>
    ["selesai", "diambil"].includes(o.status),
  ).length;
  const revenue = orders
    .filter((o) => o.status === "selesai" || o.status === "diambil")
    .reduce((sum, o) => sum + Number(o.final_cost ?? 0), 0);

  // Grafik performa harian: order masuk & selesai per hari
  const daily = new Map<string, { masuk: number; selesai: number }>();
  for (let i = 0; i < periodDays; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    daily.set(d.toISOString().slice(0, 10), { masuk: 0, selesai: 0 });
  }
  for (const o of orders) {
    const createdKey = (o.created_at as string).slice(0, 10);
    if (daily.has(createdKey)) {
      daily.get(createdKey)!.masuk += 1;
    }
    if (
      (o.status === "selesai" || o.status === "diambil") &&
      o.completed_at &&
      daily.has((o.completed_at as string).slice(0, 10))
    ) {
      daily.get((o.completed_at as string).slice(0, 10))!.selesai += 1;
    }
  }
  const perfData = [...daily.entries()].map(([date, v]) => ({
    date: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(date)),
    ...v,
  }));

  // Donat kerusakan terbanyak (semua waktu, top 6)
  const { data: allOrders } = await supabase
    .from("service_orders")
    .select("damage_type_id");

  const counts = new Map<number, number>();
  for (const o of allOrders ?? []) {
    if (o.damage_type_id) {
      counts.set(o.damage_type_id, (counts.get(o.damage_type_id) ?? 0) + 1);
    }
  }
  const donutData = [...counts.entries()]
    .map(([id, value]) => ({
      name: damageTypes.find((t) => t.id === id)?.name ?? `#${id}`,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Performa servis GANK. dalam {periodDays} hari terakhir.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface p-1">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/internal?p=${p.value}`}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                String(periodDays) === p.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-surface-muted",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: Wrench,
            label: "Order Aktif",
            value: activeOrders,
            tone: "text-accent bg-accent-soft",
          },
          {
            icon: CheckCircle2,
            label: "Selesai Periode Ini",
            value: completedOrders,
            tone: "text-success bg-success/10",
          },
          {
            icon: Banknote,
            label: "Pendapatan Servis",
            value: revenue,
            isRupiah: true,
            tone: "text-warning bg-warning/10",
          },
          {
            icon: AlertTriangle,
            label: "Notifikasi Gagal",
            value: failedNotifRes.count ?? 0,
            tone:
              (failedNotifRes.count ?? 0) > 0
                ? "text-danger bg-danger/10"
                : "text-muted-foreground bg-surface-muted",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", stat.tone)}>
                <stat.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-heading mt-0.5 truncate text-xl font-bold">
                  {"isRupiah" in stat && stat.isRupiah
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(stat.value)
                    : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafik */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Performa per Periode</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Order masuk vs servis selesai, harian.
            </p>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={perfData} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Kerusakan Terbanyak</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Distribusi jenis kerusakan yang masuk.
            </p>
          </CardHeader>
          <CardContent>
            <DamageDonut data={donutData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
