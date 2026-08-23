import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { NewOrderDialog } from "@/components/internal/new-order-dialog";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/utils";
import { Search } from "lucide-react";

export const metadata = { title: "Order Servis" };

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Semua" },
  ...["masuk", "diperiksa", "menunggu_acc", "proses", "selesai", "diambil"].map(
    (s) => ({ value: s, label: ORDER_STATUS_LABEL[s as OrderStatus] }),
  ),
];

export default async function ServisPage({
  searchParams,
}: PageProps<"/internal/servis">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";

  const supabase = await createClient();

  let query = supabase
    .from("service_orders")
    .select("id, code, customer_name, device_model, status, estimated_cost, final_cost, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) query = query.eq("status", statusFilter);
  if (q) query = query.or(`code.ilike.%${q}%,customer_name.ilike.%${q}%,device_model.ilike.%${q}%`);

  const [{ data: orders }, { data: damageTypes }] = await Promise.all([
    query,
    supabase.from("damage_types").select("id, name").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Order Servis
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kelola antrian dan progres perbaikan.
          </p>
        </div>
        <NewOrderDialog damageTypes={damageTypes ?? []} />
      </div>

      {/* Filter & pencarian */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form action="/internal/servis" method="get" className="relative w-full max-w-xs">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari kode / nama / tipe HP..."
            className="h-9 w-full rounded-lg border border-border-subtle bg-surface pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-ring"
          />
        </form>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = statusFilter === f.value;
            const hrefParams = new URLSearchParams();
            if (q) hrefParams.set("q", q);
            if (f.value) hrefParams.set("status", f.value);
            const qs = hrefParams.toString();
            return (
              <Link
                key={f.label}
                href={`/internal/servis${qs ? `?${qs}` : ""}`}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  active
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-border-subtle text-muted-foreground hover:bg-surface-muted"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tabel order */}
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        {(orders ?? []).length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Belum ada order yang cocok dengan filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium">Kode</th>
                  <th className="px-5 py-3 font-medium">Pelanggan</th>
                  <th className="px-5 py-3 font-medium">Perangkat</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Masuk</th>
                  <th className="px-5 py-3 text-right font-medium">Biaya</th>
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).map((o) => (
                  <tr
                    key={o.id}
                    className="group cursor-pointer border-b border-border-subtle/60 transition-colors last:border-0 hover:bg-surface-muted/60"
                  >
                    <td className="px-5 py-3.5">
                      <Link href={`/internal/servis/${o.id}`} className="font-mono text-xs font-semibold text-accent">
                        {o.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">{o.customer_name}</td>
                    <td className="px-5 py-3.5">{o.device_model}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={ORDER_STATUS_TONE[o.status as OrderStatus] ?? "neutral"}>
                        {ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {formatRupiah(o.final_cost ?? o.estimated_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
