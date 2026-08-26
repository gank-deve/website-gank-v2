"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, ScanLine, ShieldCheck, Zap } from "lucide-react";
import { PhoneMockup } from "@/components/public/phone-mockup";

/* Scene 3D dimuat terpisah (three.js tidak masuk bundle awal).
   Selama chunk dimuat / WebGL gagal → mockup statis tampil. */
const HeroScene = dynamic(
  () => import("@/components/public/hero-scene").then((m) => m.HeroScene),
  { ssr: false, loading: () => <PhoneMockup /> },
);

const pillars = [
  { icon: ShieldCheck, label: "Jujur" },
  { icon: Zap, label: "Cepat" },
  { icon: ScanLine, label: "Transparan" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Parallax scroll (lapisan dekoratif)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const layer = <T,>(v: T) => (reduce ? undefined : v);

  // Spotlight mengikuti kursor
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);
  const sx = useSpring(mx, { stiffness: 250, damping: 30 });
  const sy = useSpring(my, { stiffness: 250, damping: 30 });
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, rgba(76,141,255,0.10), transparent 65%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative overflow-hidden"
    >
      {/* Layer belakang: grid */}
      <motion.div
        aria-hidden
        style={layer({ y: ySlow })}
        className="absolute inset-[-10%] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
      />

      {/* Layer tengah: glow electric blue */}
      <motion.div aria-hidden style={layer({ y: yFast })} className="absolute inset-0">
        <div className="absolute top-[15%] left-[8%] h-72 w-72 rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute right-[6%] bottom-[6%] h-80 w-80 rounded-full bg-blue-500/15 blur-[140px]" />
      </motion.div>

      {/* Spotlight kursor */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 z-10"
        />
      )}

      {/* Konten utama */}
      <div className="relative z-20 mx-auto grid min-h-[100svh] max-w-6xl items-center gap-14 px-6 pt-36 pb-24 lg:grid-cols-[1.05fr_.95fr]">
        <motion.div style={layer({ y: yText, opacity })}>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Servis HP & Jual Beli HP Bekas
          </div>

          <h1 className="font-heading mt-6 text-6xl leading-none font-bold tracking-tighter text-white sm:text-7xl xl:text-8xl">
            GANK<span className="text-blue-500">.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
            HP rusak bukan akhir dunia. Kami perbaiki dengan prinsip yang bisa
            kamu pegang:
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {pillars.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors duration-200 hover:border-blue-500/40 hover:text-white"
              >
                <p.icon className="h-4 w-4 text-blue-500" />
                {p.label}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#diagnosa"
              className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold whitespace-nowrap text-white shadow-lg shadow-blue-600/30 transition-colors duration-200 hover:bg-blue-500"
            >
              Cek Kerusakanmu
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/tracking"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-semibold whitespace-nowrap text-zinc-200 transition-colors duration-200 hover:border-blue-500/50 hover:text-white"
            >
              Lacak Status Servis
            </Link>
          </div>
        </motion.div>

        {/* HP 3D interaktif — tampil di semua perangkat, stack di mobile */}
        <motion.div style={layer({ opacity })}>
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}
