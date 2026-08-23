import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Smartphone, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-heading text-2xl font-bold tracking-tight text-white">
            GANK<span className="text-blue-500">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
            Servis HP dan jual beli HP bekas dengan satu prinsip:{" "}
            <span className="text-zinc-200">jujur, cepat, transparan.</span>
            Setiap proses tercatat dan bisa kamu pantau kapan saja.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Navigasi
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className="text-zinc-400 transition-colors hover:text-white">Beranda</Link></li>
            <li><Link href="/katalog" className="text-zinc-400 transition-colors hover:text-white">Katalog HP Bekas</Link></li>
            <li><Link href="/tracking" className="text-zinc-400 transition-colors hover:text-white">Lacak Servis</Link></li>
            <li>
              <a
                href={`https://wa.me/${BRAND.waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Hubungi WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
            Kontak & Jam Buka
          </p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              {BRAND.address}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              {BRAND.hours}
            </li>
            <li className="flex items-start gap-2">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              WA: +{BRAND.waNumber}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} GANK. Semua hak dilindungi.
      </div>
    </footer>
  );
}
