"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

const NOTIFICATIONS = [
  { code: "GANK-SVC-2608-A1F3", status: "Proses Servis", tone: "blue" },
  { code: "GANK-SVC-2608-B7K2", status: "Menunggu ACC Pelanggan", tone: "amber" },
  { code: "GANK-SVC-2608-A1F3", status: "Selesai — checklist akhir 12/12", tone: "green" },
  { code: "GANK-SVC-2608-C4M9", status: "Sudah Diambil. Terima kasih!", tone: "zinc" },
] as const;

const TONE_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  zinc: "bg-zinc-500",
};

export function PhoneMockup() {
  const reduce = useReducedMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 140, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 140, damping: 18 });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % NOTIFICATIONS.length),
      2400,
    );
    return () => clearInterval(t);
  }, [reduce]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // mousemove hanya terjadi pada pointer presisi (mouse/trackpad)
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 16);
    rx.set(-((e.clientY - rect.top) / rect.height - 0.5) * 12);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const notif = NOTIFICATIONS[index];

  return (
    <div
      className="relative mx-auto w-fit cursor-default [perspective:1200px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* glow bawah ponsel */}
      <div
        aria-hidden
        className="absolute inset-x-8 bottom-[-30px] h-24 rounded-full bg-blue-600/25 blur-3xl"
      />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-[420px] w-[210px] rounded-[2.6rem] border border-white/15 bg-gradient-to-b from-zinc-800 to-zinc-900 p-2 shadow-2xl shadow-blue-950/60 sm:h-[470px] sm:w-[236px]"
      >
        {/* layar */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#0b1020] via-zinc-950 to-black">
          {/* notch */}
          <div className="absolute top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

          {/* header layar */}
          <div className="mt-12 px-4">
            <p className="font-heading text-sm font-bold text-white">
              GANK<span className="text-blue-500">.</span>
            </p>
            <p className="text-[10px] tracking-widest text-zinc-500 uppercase">
              Status Servis Live
            </p>
          </div>

          {/* notifikasi bergantian */}
          <div className="mt-4 space-y-2.5 px-3">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={index}
                initial={reduce ? false : { opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: 14, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.21, 0.65, 0.35, 1] }}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">
                    G
                  </span>
                  <p className="text-[10px] font-medium text-zinc-300">
                    GANK. · sekarang
                  </p>
                  <span
                    aria-hidden
                    className={`ml-auto h-1.5 w-1.5 rounded-full ${TONE_DOT[notif.tone]}`}
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] tracking-wider text-blue-400">
                  {notif.code}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-white">
                  Servis kamu: {notif.status}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* kerangka pesan samar */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 opacity-40">
              <div className="h-2 w-24 rounded-full bg-zinc-700" />
              <div className="mt-2 h-2 w-full rounded-full bg-zinc-800" />
              <div className="mt-1.5 h-2 w-3/4 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* stepper mini */}
          <div className="mt-auto px-5 pb-6">
            <div className="flex items-center gap-1.5">
              {["Masuk", "Proses", "Selesai", "Ambil"].map((step, i) => (
                <div key={step} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-colors duration-500 ${
                      i <= index ? "bg-blue-500" : "bg-zinc-800"
                    }`}
                  />
                  <p
                    className={`mt-1 text-center text-[7px] leading-none ${
                      i <= index ? "text-blue-400" : "text-zinc-700"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* kartu mengambang: checklist */}
      <motion.div
        aria-hidden
        style={{ transform: "translateZ(60px)" }}
        className="absolute -left-16 top-14 hidden rounded-2xl border border-white/10 bg-zinc-900/90 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block lg:-left-24"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
            ✓
          </span>
          <div>
            <p className="text-[11px] font-medium text-white">Checklist Akhir</p>
            <p className="text-[10px] text-zinc-500">12/12 fungsi lolos</p>
          </div>
        </div>
      </motion.div>

      {/* kartu mengambang: garansi */}
      <motion.div
        aria-hidden
        style={{ transform: "translateZ(80px)" }}
        className="absolute -right-14 bottom-20 hidden rounded-2xl border border-white/10 bg-zinc-900/90 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block lg:-right-20"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/25 text-xs text-blue-400">
            90
          </span>
          <div>
            <p className="text-[11px] font-medium text-white">Hari Garansi</p>
            <p className="text-[10px] text-zinc-500">tukit komponen</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
