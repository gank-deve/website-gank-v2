import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { Smartphone } from "lucide-react";

export const metadata: Metadata = { title: "Katalog HP Bekas" };

export default async function KatalogPage({
  searchParams,
}: PageProps<"/katalog">) {
  const { brand } = await searchParams;

  let listings: Array<{
    id: string;
    brand: string;
    model: string;
    storage: string;
    ram: string;
    color: string;
    condition_grade: string;
    price: number;
    photos: string[] | null;
  }> = [];
  let brands: string[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("phone_listings")
        .select(
          "id, brand, model, storage, ram, color, condition_grade, price, photos",
        )
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (typeof brand === "string" && brand && brand !== "semua") {
        query = query.eq("brand", brand);
      }

      const [{ data }, { data: allBrands }] = await Promise.all([
        query,
        supabase.from("phone_listings").select("brand").eq("status", "available"),
      ]);
      listings = data ?? [];
      brands = [...new Set((allBrands ?? []).map((b) => b.brand))].sort();
    } catch {
      // Supabase belum terhubung — tampilkan state kosong
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-36 pb-24">
      <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
        Katalog
      </p>
      <h1 className="font-heading mt-3 text-4xl font-bold tracking-tight text-white">
        HP Bekas Terverifikasi
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
        Semua unit sudah melewati tes fungsi lengkap di GANK. Grade kondisi
        ditulis apa adanya — tanpa polesan foto.
      </p>

      {/* Filter brand */}
      <div className="mt-8 flex flex-wrap gap-2">
        {["semua", ...brands].map((b) => {
          const active = (brand ?? "semua") === b;
          const href = b === "semua" ? "/katalog" : `/katalog?brand=${encodeURIComponent(b)}`;
          return (
            <Link
              key={b}
              href={href}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors duration-200 ${
                active
                  ? "border-blue-500 bg-blue-600/20 text-blue-400"
                  : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {b === "semua" ? "Semua Brand" : b}
            </Link>
          );
        })}
      </div>

      {listings.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-white/15 p-14 text-center">
          <Smartphone className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-4 text-sm text-zinc-400">
            Belum ada stok yang cocok. Coba hapus filter atau hubungi kami via
            WhatsApp untuk carikan unit.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <Link
              key={item.id}
              href={`/katalog/${item.id}`}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.05]"
            >
              {/* Foto cover */}
              <div className="relative aspect-[4/3] bg-zinc-900">
                {item.photos?.[0] ? (
                  <Image
                    src={item.photos[0]}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-90"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Smartphone className="h-8 w-8 text-zinc-700" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6 pt-4">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium tracking-widest text-blue-500 uppercase">
                    {item.brand}
                  </span>
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-zinc-400 capitalize">
                    {item.condition_grade}
                  </span>
                </div>
                <h2 className="font-heading mt-2 text-lg font-semibold text-white">
                  {item.model}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {[item.storage, item.ram && `RAM ${item.ram}`, item.color]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-auto flex items-end justify-between pt-5">
                  <span className="font-heading text-xl font-bold text-white">
                    {formatRupiah(item.price)}
                  </span>
                  <span className="text-sm font-medium text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Detail →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
