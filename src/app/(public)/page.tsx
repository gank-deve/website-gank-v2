import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/public/hero";
import { BrandMarquee } from "@/components/public/brand-marquee";
import { StatsStrip } from "@/components/public/stats-strip";
import { DiagnosisWidget } from "@/components/public/diagnosis-widget";
import { Reveal, SectionHeading } from "@/components/public/reveal";
import { formatRupiah } from "@/lib/utils";
import {
  Wrench,
  ShoppingBag,
  BadgeDollarSign,
  Repeat,
  Eye,
  FileCheck2,
  MessageCircleCheck,
} from "lucide-react";

export const metadata = { title: "GANK. — Servis HP & Jual Beli HP Bekas" };

const services = [
  {
    icon: Wrench,
    title: "Servis HP",
    desc: "Kerusakan hardware & software ditangani teknisi berpengalaman. Setiap order lewat checklist fungsional awal dan akhir — hasil servis konsisten.",
  },
  {
    icon: ShoppingBag,
    title: "Beli HP Bekas",
    desc: "Stok HP bekas terkurasi dengan grade kondisi jelas dan harga transparan. Semua fungsi sudah dites penuh sebelum dijual.",
  },
  {
    icon: BadgeDollarSign,
    title: "Jual HP-mu",
    desc: "Harga wajar berdasarkan kondisi real, bukan tebak-tebakan. Penawaran langsung hari itu juga.",
  },
  {
    icon: Repeat,
    title: "Trade-In",
    desc: "Tukar tambah HP lama ke unit baru dari katalog kami. Selisihnya jelas, tanpa biaya tersembunyi.",
  },
];

const steps = [
  {
    icon: FileCheck2,
    title: "Order & Checklist Awal",
    desc: "Saat HP masuk, kami rekam kondisi semua fungsi lewat checklist fungsional awal. Kamu tahu persis kondisi awal perangkatmu.",
  },
  {
    icon: Wrench,
    title: "Proses Servis",
    desc: "Teknisi memperbaiki sesuai diagnosis. Jika ada temuan tambahan, kami hubungi dulu — tidak ada biaya kejutan.",
  },
  {
    icon: Eye,
    title: "Checklist Akhir",
    desc: "Sebelum disebut selesai, semua fungsi dites ulang dan dibandingkan dengan checklist awal. Tidak lolos tes, tidak diambil.",
  },
  {
    icon: MessageCircleCheck,
    title: "Notifikasi WhatsApp",
    desc: "Setiap perubahan status dikirim otomatis ke WhatsApp-mu, lengkap dengan link lacak progres real-time.",
  },
];

async function getPreviewListings() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("phone_listings")
      .select("id, brand, model, storage, condition_grade, price, photos")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const listings = await getPreviewListings();

  return (
    <>
      <Hero />
      <BrandMarquee />
      <StatsStrip />

      {/* Layanan */}
      <section className="relative bg-zinc-950 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Layanan Kami"
            title="Semua urusan HP, satu tempat."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="group h-full cursor-default rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.06]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-500 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading mt-4 text-lg font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnosa Cepat — widget interaktif */}
      <DiagnosisWidget />

      {/* Cara kerja */}
      <section className="border-y border-white/10 bg-zinc-900/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Cara Kerja"
            title="Transparan dari masuk sampai ambil."
          />
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="relative h-full rounded-2xl border border-white/10 bg-zinc-950 p-6 transition-colors duration-200 hover:border-blue-500/30">
                    <span className="font-heading absolute top-5 right-5 text-4xl font-bold text-white/5">
                      0{i + 1}
                    </span>
                    <step.icon className="h-6 w-6 text-blue-500" />
                    <h3 className="font-heading mt-4 font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Katalog preview */}
      <section className="bg-zinc-950 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading kicker="Katalog" title="HP bekas siap pakai." />
            <Link
              href="/katalog"
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Lihat semua
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          {listings.length === 0 ? (
            <Reveal delay={0.1}>
              <p className="mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
                Stok akan segera hadir. Hubungi WhatsApp untuk permintaan unit.
              </p>
            </Reveal>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.08} className="h-full">
                  <Link
                    href={`/katalog/${item.id}`}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.05]"
                  >
                    {item.photos?.[0] && (
                      <div className="relative aspect-[16/10] bg-zinc-900">
                        <Image
                          src={item.photos[0]}
                          alt={`${item.brand} ${item.model}`}
                          fill
                          sizes="(max-width:768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6 pt-5">
                      <p className="text-xs font-medium tracking-widest text-blue-500 uppercase">
                        {item.brand}
                      </p>
                      <h3 className="font-heading mt-2 text-lg font-semibold text-white">
                        {item.model}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-6">
                        <span className="font-heading text-xl font-bold text-white">
                          {formatRupiah(item.price)}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-zinc-400 capitalize">
                          {item.condition_grade}
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA akhir */}
      <section className="relative overflow-hidden border-t border-white/10 bg-zinc-950 py-24">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px]"
        />
        <Reveal className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            HP bermasalah? Bawa aja.
          </h2>
          <p className="mt-4 text-zinc-400">
            Konsultasi gratis, diagnosis jujur, harga jelas di depan.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=${encodeURIComponent("Halo GANK., saya mau konsultasi servis HP.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors duration-200 hover:bg-blue-500"
          >
            Chat WhatsApp Sekarang
          </a>
        </Reveal>
      </section>
    </>
  );
}
