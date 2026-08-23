import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/public/gallery";
import { formatRupiah, normalizeWaNumber } from "@/lib/utils";
import { BRAND } from "@/lib/constants";
import {
  ArrowLeft,
  Cpu,
  Battery,
  Palette,
  ShieldCheck,
  MessageCircle,
  BadgeCheck,
} from "lucide-react";

export const metadata: Metadata = { title: "Detail HP Bekas" };

const gradeDesc: Record<string, string> = {
  mulus: "Nyaris tanpa bekas pakai, kondisi terbaik di kelasnya.",
  baik: "Bekas pakai ringan pada bodi, fungsi 100% normal.",
  layak: "Terlihat bekas pakai namun performa tetap prima.",
};

export default async function ListingDetailPage({
  params,
}: PageProps<"/katalog/[id]">) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("phone_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "available")
    .single();

  if (!item) notFound();

  const waText = encodeURIComponent(
    `Halo GANK., saya tertarik dengan ${item.brand} ${item.model} (${item.storage}) seharga ${formatRupiah(item.price)}. Masih tersedia?`,
  );
  const waHref = `https://wa.me/${normalizeWaNumber(BRAND.waNumber)}?text=${waText}`;

  const specs = [
    { icon: Cpu, label: "Penyimpanan", value: item.storage || "-" },
    { icon: Cpu, label: "RAM", value: item.ram || "-" },
    { icon: Palette, label: "Warna", value: item.color || "-" },
    {
      icon: Battery,
      label: "Grade",
      value: `${item.condition_grade} — ${gradeDesc[item.condition_grade] ?? ""}`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-36 pb-24">
      <Link
        href="/katalog"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke katalog
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Visual unit */}
        <Gallery photos={(item.photos as string[] | null) ?? []} alt={`${item.brand} ${item.model}`} />

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-500/30 bg-blue-600/15 px-3 py-1 text-xs font-medium text-blue-400">
              {item.brand}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 capitalize">
              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
              Grade {item.condition_grade}
            </span>
          </div>

          <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {item.model}
          </h1>

          <p className="font-heading mt-4 text-3xl font-bold text-blue-500">
            {formatRupiah(item.price)}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <dt className="flex items-center gap-2 text-xs text-zinc-500">
                  <spec.icon className="h-4 w-4 text-blue-500" />
                  {spec.label}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-zinc-100 capitalize">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          {item.description && (
            <p className="mt-6 text-sm leading-relaxed text-zinc-400">
              {item.description}
            </p>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed text-zinc-400">
              Unit ini sudah lolos <strong className="text-zinc-200">checklist fungsional lengkap</strong>:
              layar, kamera, speaker, mic, WiFi, baterai, charging, dan biometrik
              dites ulang sebelum dilepas.
            </p>
          </div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors duration-200 hover:bg-blue-500 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" />
            Nego via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
