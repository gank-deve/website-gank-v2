"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1.8,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  if (reduce) {
    return (
      <span ref={ref}>
        {to.toLocaleString("id-ID", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref}>
      {value.toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

const STATS: Array<{ to: number; decimals?: number; suffix?: string; label: string }> = [
  { to: 5000, suffix: "+", label: "HP Diperbaiki" },
  { to: 4.9, decimals: 1, suffix: "/5", label: "Rating Pelanggan" },
  { to: 90, suffix: " Hari", label: "Garansi Servis" },
  { to: 100, suffix: "%", label: "Harga Transparan" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-3xl font-bold text-white sm:text-4xl">
              <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
