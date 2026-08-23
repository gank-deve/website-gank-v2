"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/tracking", label: "Lacak Servis" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <header className="fixed inset-x-4 top-4 z-40 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      {/* progres scroll */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blue-600"
      />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-white"
        >
          GANK<span className="text-blue-500">.</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-500"
          >
            Chat WhatsApp
          </a>
        </div>

        <button
          className="cursor-pointer rounded-lg p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-5 pt-2 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Chat WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
