"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCheck, Hand, Layers, RotateCcw } from "lucide-react";
import { PhoneMockup } from "@/components/public/phone-mockup";
import {
  CursorLight,
  PART_LABELS,
  PhoneAssembly,
  createInput,
  type PartKey,
} from "@/components/public/phone-model";

const PART_ORDER: PartKey[] = ["layar", "kamera", "board", "baterai"];

/* ------------------------------------------------------------------ */
/* Error boundary → fallback mockup statis                             */
/* ------------------------------------------------------------------ */

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <PhoneMockup /> : this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* HeroScene                                                           */
/* ------------------------------------------------------------------ */

export function HeroScene() {
  const reduce = useReducedMotion();

  /* Komponen client-only (dynamic ssr:false) → akses window aman di init */
  const [webglOk] = useState(hasWebGL);
  const [lowPower] = useState(
    () =>
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 768,
  );
  const [active, setActive] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [selectedKey, setSelectedKey] = useState<PartKey | null>(null);
  const [hovered, setHovered] = useState<PartKey | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const input = useRef(createInput());
  const lastDown = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const prevXY = useRef({ x: 0, y: 0 });

  /* Render hanya saat terlihat & tab aktif.
     IntersectionObserver selalu mengirim callback awal sendiri. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let onScreen = false;
    const update = () => setActive(onScreen && !document.hidden);

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  /* Drag memutar — horizontal penuh, vertikal terbatas; scroll tetap jalan di sentuh */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    lastDown.current = { x: e.clientX, y: e.clientY };
    dragging.current = true;
    prevXY.current = { x: e.clientX, y: e.clientY };
    input.current.down();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const inp = input.current;
    inp.pointer(
      (e.clientX - rect.left) / rect.width - 0.5,
      -((e.clientY - rect.top) / rect.height - 0.5),
    );

    if (!dragging.current || reduce) return;
    const dx = e.clientX - prevXY.current.x;
    const dy = e.clientY - prevXY.current.y;
    prevXY.current = { x: e.clientX, y: e.clientY };
    inp.drag(dx, dy);
  };

  const endDrag = () => {
    dragging.current = false;
  };

  if (!webglOk) return <PhoneMockup />;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Panggung canvas — aspect tetap agar tanpa layout shift */}
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => {
          endDrag();
          setHovered(null);
        }}
        className="relative aspect-[4/5] w-full max-w-md touch-pan-y cursor-grab select-none overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-xl shadow-blue-950/30 active:cursor-grabbing sm:aspect-square lg:max-w-none"
        role="img"
        aria-label="Model tiga dimensi HP yang bisa diputar dan dibongkar: layar, kamera, board logika, dan baterai"
      >
        <SceneBoundary>
          <Canvas
            frameloop={active ? "always" : "never"}
            dpr={lowPower ? [1, 1.5] : [1, 2]}
            camera={{ fov: 38, position: [0, 0.35, 7.6] }}
            gl={{
              alpha: true,
              antialias: !lowPower,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => gl.setClearAlpha(0)}
          >
            <ambientLight intensity={0.55} />
            <directionalLight position={[5, 8, 4]} intensity={1.6} />
            <pointLight
              position={[-4.5, -2, -3]}
              color="#2563eb"
              intensity={38}
              distance={13}
              decay={1.7}
            />
            <CursorLight input={input} />

            <PhoneAssembly
              exploded={!!exploded}
              instant={!!reduce}
              lowPower={lowPower}
              selectedKey={selectedKey}
              hovered={reduce ? null : hovered}
              input={input}
              onSelect={(p) => setSelectedKey((cur) => (cur === p ? null : p))}
              onHover={setHovered}
              lastDown={lastDown}
            />
          </Canvas>
        </SceneBoundary>

        {/* Badge checklist saat mode terurai */}
        <AnimatePresence>
          {exploded && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-green-500/40 bg-zinc-950/80 px-3 py-1.5 backdrop-blur"
            >
              <CheckCheck className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[11px] font-medium text-green-300">
                Checklist 12/12 lolos
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pilihan komponen aktif — chip kecil pojok kiri atas */}
        <AnimatePresence>
          {selectedKey && (
            <motion.div
              key={selectedKey}
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute top-3 left-3 rounded-full border border-blue-500/50 bg-blue-600/25 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
            >
              {PART_LABELS[selectedKey]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legenda komponen — aksesibel & alternatif tap pada mesh */}
      <div
        className="mt-5 flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Pilih komponen untuk ditandai"
      >
        {PART_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setSelectedKey((cur) => (cur === p ? null : p))}
            aria-pressed={selectedKey === p}
            className={`min-h-11 cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none ${
              selectedKey === p
                ? "border-blue-500 bg-blue-600/20 text-white"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-blue-500/40 hover:text-white"
            }`}
          >
            {PART_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Tombol bongkar / rakit — signature moment */}
      <button
        type="button"
        onClick={() => {
          setExploded((v) => !v);
          setSelectedKey(null);
        }}
        className="mt-3 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors duration-200 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
      >
        {exploded ? (
          <>
            <RotateCcw className="h-4 w-4" />
            Rakit Ulang
          </>
        ) : (
          <>
            <Layers className="h-4 w-4" />
            Lihat Dalam
          </>
        )}
      </button>

      <p className="mt-3 flex items-center gap-1.5 text-center text-xs text-zinc-400">
        <Hand className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
        Seret untuk memutar · Ketuk komponen untuk detailnya
      </p>
    </div>
  );
}
