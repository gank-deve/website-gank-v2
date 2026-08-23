"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const cover = photos[index];

  if (photos.length === 0 || !cover) {
    // Placeholder tanpa foto
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="text-center">
          <div className="mx-auto flex h-24 w-14 items-end justify-center rounded-xl border-2 border-blue-500/40 bg-zinc-900 p-1 shadow-lg shadow-blue-600/20">
            <div className="h-full w-full rounded-lg bg-gradient-to-b from-blue-600/30 to-transparent" />
          </div>
          <p className="mt-4 text-xs tracking-widest text-zinc-500 uppercase">
            Foto unit menyusul
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Foto utama */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
        <Image
          key={cover}
          src={cover}
          alt={alt}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 520px"
          className="object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => setIndex((index - 1 + photos.length) % photos.length)}
              className="absolute top-1/2 left-3 h-9 w-9 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => setIndex((index + 1) % photos.length)}
              className="absolute top-1/2 right-3 h-9 w-9 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
            >
              ›
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white backdrop-blur">
              {index + 1}/{photos.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail */}
      {photos.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              aria-label={`Lihat foto ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors duration-200",
                i === index ? "border-blue-500" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image src={p} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
