import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_TONE,
  type OrderStatus,
} from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/utils";
import { Search, PackageSearch, CircleCheck } from "lucide-react";

export const metadata: Metadata = { title: "Lacak Status Servis" };

export default async function TrackingPage({
  searchParams,
}: PageProps<"/tracking">) {
  const { code } = await searchParams;
  const query = typeof code === "string" ? code.trim() : "";

  let order: {
    code: string;
    device_model: string;
    status: string;
    estimated_cost: number | null;
    final_cost: number | null;
    created_at: string;
    updated_at: string;
  } | null = null;
  let history: Array<{ status: string; created_at: string }> = [];
  let notFoundCode = false;

  if (query && hasSupabaseEnv()) {
    const supabase = await createClient();
    const [{ data }, { data: hist }] = await Promise.all([
      supabase.rpc("track_order", { p_code: query }),
      supabase.rpc("track_order_history", { p_code: query }),
    ]);
    order = data?.[0] ?? null;
    history = hist ?? [];
    notFoundCode = !order;
  }

  const currentIdx = order
    ? ORDER_STATUS_FLOW.indexOf(order.status as OrderStatus)
    : -1;
  const orderStatus = (order?.status ?? "masuk") as OrderStatus;

  return (
    <div className="mx-auto max-w-3xl px-6 pt-36 pb-24">
      <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
        Lacak Servis
      </p>
      <h1 className="font-heading mt-3 text-4xl font-bold tracking-tight text-white">
        Cek Progres Perbaikan
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Masukkan kode order yang kamu terima saat HP didaftarkan (contoh:
        GANK-SVC-2608-A1B2).
      </p>

      <form action="/tracking" method="get" className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="code"
            defaultValue={query}
            placeholder="GANK-SVC-XXXX"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pr-4 pl-11 text-sm text-white uppercase placeholder:normal-case placeholder:text-zinc-600 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
        >
          Lacak
        </button>
      </form>

      {query && notFoundCode && (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-red-500/30 bg-red-500/[0.05] p-10 text-center">
          <PackageSearch className="h-8 w-8 text-red-400" />
          <p className="mt-4 text-sm text-zinc-300">
            Order dengan kode <strong>{query}</strong> tidak ditemukan.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Periksa kembali kodenya atau hubungi kami via WhatsApp.
          </p>
        </div>
      )}

      {order && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-bold text-white">
                  {order.device_model}
                </p>
                <p className="mt-0.5 text-xs tracking-widest text-zinc-500">
                  {order.code}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  ORDER_STATUS_TONE[orderStatus] === "success"
                    ? "border-green-500/40 bg-green-500/10 text-green-400"
                    : ORDER_STATUS_TONE[orderStatus] === "warning"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : "border-blue-500/40 bg-blue-500/10 text-blue-400"
                }`}
              >
                {ORDER_STATUS_LABEL[orderStatus] ?? order.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500">Masuk</p>
                <p className="mt-0.5 text-zinc-200">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Update terakhir</p>
                <p className="mt-0.5 text-zinc-200">{formatDate(order.updated_at)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">
                  {order.final_cost !== null ? "Biaya akhir" : "Estimasi biaya"}
                </p>
                <p className="mt-0.5 text-zinc-200">
                  {formatRupiah(order.final_cost ?? order.estimated_cost)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-heading text-sm font-semibold tracking-wide text-zinc-300 uppercase">
              Progres Servis
            </h2>
            <ol className="mt-5 space-y-0">
              {ORDER_STATUS_FLOW.map((status, i) => {
                const done = i <= currentIdx && orderStatus !== "batal";
                const histEntry = history.find((h) => h.status === status);
                return (
                  <li key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <CircleCheck
                        className={`h-5 w-5 ${done ? "text-blue-500" : "text-zinc-700"}`}
                      />
                      {i < ORDER_STATUS_FLOW.length - 1 && (
                        <span
                          className={`w-px flex-1 ${i < currentIdx ? "bg-blue-500/50" : "bg-zinc-800"}`}
                        />
                      )}
                    </div>
                    <div className={i === ORDER_STATUS_FLOW.length - 1 ? "" : "pb-6"}>
                      <p
                        className={`text-sm font-medium ${done ? "text-white" : "text-zinc-600"}`}
                      >
                        {ORDER_STATUS_LABEL[status]}
                      </p>
                      {histEntry && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {formatDate(histEntry.created_at)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
