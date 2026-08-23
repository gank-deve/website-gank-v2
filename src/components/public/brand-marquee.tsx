const BRANDS = [
  "iPhone",
  "Samsung",
  "Xiaomi",
  "OPPO",
  "vivo",
  "Realme",
  "Infinix",
  "Tecno",
  "ASUS ROG",
  "Google Pixel",
  "Huawei",
  "advan",
];

export function BrandMarquee() {
  const row = [...BRANDS, ...BRANDS];

  return (
    <section
      aria-label="Merek HP yang dilayani"
      className="group relative overflow-hidden border-y border-white/10 bg-zinc-950 py-5"
    >
      {/* fade pinggir */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div className="flex w-max animate-marquee items-center gap-12 pr-12 group-hover:[animation-play-state:paused]">
        {row.map((brand, i) => (
          <span key={i} aria-hidden={i >= BRANDS.length} className="flex items-center gap-12">
            <span className="font-heading text-lg font-semibold whitespace-nowrap text-zinc-600 transition-colors duration-200 hover:text-blue-500">
              {brand}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600/50" />
          </span>
        ))}
      </div>
    </section>
  );
}
