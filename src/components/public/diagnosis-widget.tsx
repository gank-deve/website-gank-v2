"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Smartphone,
  BatteryCharging,
  Droplets,
  Usb,
  Volume2,
  Camera,
  Cpu,
  CircleHelp,
  Clock,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const OPTIONS = [
  { icon: Smartphone, label: "Layar pecah / sentuh error", price: "Rp350rb – Rp1,8jt", time: "60–90 menit" },
  { icon: BatteryCharging, label: "Baterai cepat drop", price: "Rp250rb – Rp650rb", time: "±30 menit" },
  { icon: Usb, label: "Susah charging / port longgar", price: "Rp150rb – Rp400rb", time: "±45 menit" },
  { icon: Volume2, label: "Speaker / mic pelan", price: "Rp120rb – Rp350rb", time: "±45 menit" },
  { icon: Camera, label: "Kamera buram / mati", price: "Rp300rb – Rp900rb", time: "60–90 menit" },
  { icon: Cpu, label: "Bootloop / software error", price: "Rp100rb – Rp300rb", time: "1–2 jam" },
  { icon: Droplets, label: "Kena air", price: "Mulai Rp200rb (diagnosis dulu)", time: "1–3 hari" },
  { icon: CircleHelp, label: "Belum yakin / lainnya", price: "Konsultasi gratis", time: "Diagnosis ±15 menit" },
];

export function DiagnosisWidget() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [model, setModel] = useState("");

  const option = selected !== null ? OPTIONS[selected] : null;

  const waHref = useMemo(() => {
    if (!option) return "#";
    const text = [
      `Halo GANK., saya mau servis HP.`,
      model ? `Tipe: ${model}.` : "",
      `Keluhan: ${option.label}.`,
      `Dari estimasi di website: ${option.price} (${option.time}).`,
      `Bisa dijadwalkan hari ini?`,
    ]
      .filter(Boolean)
      .join(" ");
    return `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}?text=${encodeURIComponent(text)}`;
  }, [option, model]);

  return (
    <section id="diagnosa" className="relative overflow-hidden bg-zinc-950 py-24">
      {/* glow latar */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
            Diagnosa Cepat
          </p>
          <h2 className="font-heading mx-auto mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pilih gejalanya, harga muncul seketika.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
            Tanpa daftar, tanpa antre. Ini estimasi awal — harga final tetap
            dikonfirmasi setelah pemeriksaan, seperti janji kami: transparan.
          </p>
        </div>

        {/* Chip gejala */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {OPTIONS.map((opt, i) => {
            const active = selected === i;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelected(active ? null : i)}
                aria-pressed={active}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3 py-5 text-center transition-colors duration-200 ${
                  active
                    ? "border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-600/20"
                    : "border-white/10 bg-white/[0.03] hover:border-blue-500/40 hover:bg-blue-500/[0.06]"
                }`}
              >
                <opt.icon
                  className={`h-6 w-6 ${active ? "text-blue-400" : "text-zinc-400"}`}
                />
                <span
                  className={`text-xs leading-snug ${active ? "font-medium text-white" : "text-zinc-400"}`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel hasil */}
        <AnimatePresence mode="wait">
          {option && (
            <motion.div
              key={selected}
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.21, 0.65, 0.35, 1] }}
              className="mt-8 overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/15 via-zinc-900 to-zinc-900"
            >
              <div className="grid md:grid-cols-[1fr_auto] md:items-center">
                <div className="p-7">
                  <p className="text-xs tracking-widest text-blue-400 uppercase">
                    Estimasi {option.label.toLowerCase()}
                  </p>
                  <p className="font-heading mt-2 text-3xl font-bold text-white sm:text-4xl">
                    {option.price}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      Durasi {option.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                      Garansi tukit 90 hari
                    </span>
                  </div>

                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Tipe HP kamu (opsional, cth: iPhone 11)"
                    className="mt-5 h-10 w-full max-w-sm rounded-xl border border-white/10 bg-black/30 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/25"
                  />
                </div>

                <div className="border-t border-white/10 p-7 md:border-t-0 md:border-l">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold whitespace-nowrap text-white shadow-lg shadow-blue-600/30 transition-colors duration-200 hover:bg-blue-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Jadwalkan via WhatsApp
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                  <p className="mt-3 text-center text-xs text-zinc-500 md:max-w-44">
                    Pesan sudah terisi otomatis dari estimasi di atas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
