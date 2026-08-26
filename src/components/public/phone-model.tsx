"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Konstanta model                                                     */
/* ------------------------------------------------------------------ */

export const PHONE_W = 1.62;
export const PHONE_H = 3.3;
export const PHONE_D = 0.18;

const ACCENT = "#2563eb";

export type PartKey = "layar" | "kamera" | "board" | "baterai";

export const PART_LABELS: Record<PartKey, string> = {
  layar: "Layar",
  kamera: "Kamera",
  board: "Board Logika",
  baterai: "Baterai",
};

const PART_ORDER: PartKey[] = ["layar", "kamera", "board", "baterai"];

interface PartPose {
  pos: [number, number, number];
  rot: [number, number, number];
}

const POSES: Record<PartKey, { assembled: PartPose; exploded: PartPose }> = {
  layar: {
    assembled: { pos: [0, 0, PHONE_D / 2], rot: [0, 0, 0] },
    exploded: { pos: [0, 0.05, PHONE_D / 2 + 0.95], rot: [-0.07, 0, 0] },
  },
  kamera: {
    assembled: { pos: [0, 1.12, -0.01], rot: [0, 0, 0] },
    exploded: { pos: [0.1, 2.02, -0.5], rot: [0.42, 0.15, -0.08] },
  },
  board: {
    assembled: { pos: [0, 0.72, 0], rot: [0, 0, 0] },
    exploded: { pos: [0, 0.78, -0.78], rot: [0.12, 0.28, 0] },
  },
  baterai: {
    assembled: { pos: [0, -0.52, 0], rot: [0, 0, 0] },
    exploded: { pos: [0, -0.68, -1.18], rot: [0.1, -0.32, 0.05] },
  },
};

const LABEL_POS: Record<PartKey, [number, number, number]> = {
  layar: [-0.35, -1.85, 1.1],
  kamera: [0.95, 2.35, -0.4],
  board: [0.95, 0.82, -0.75],
  baterai: [0.8, -0.72, -1.15],
};

const BODY_EXPLODED_Z = -0.2;
const STAGGER = 0.09;
const DURATION = 0.55;

const PART_MAT: Record<
  PartKey,
  { color: string; roughness: number; metalness: number }
> = {
  layar: { color: "#0a1020", roughness: 0.18, metalness: 0.25 },
  kamera: { color: "#18181b", roughness: 0.32, metalness: 0.6 },
  board: { color: "#26262b", roughness: 0.42, metalness: 0.5 },
  baterai: { color: "#3f3f46", roughness: 0.4, metalness: 0.6 },
};

/* Material statis dibuat sekali (scene dipakai satu instance) */
let ACCENT_MAT: THREE.MeshStandardMaterial | null = null;
function accentMat() {
  ACCENT_MAT ??= new THREE.MeshStandardMaterial({
    color: new THREE.Color(ACCENT),
    emissive: new THREE.Color(ACCENT),
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.3,
  });
  return ACCENT_MAT;
}

let DARK_MAT: THREE.MeshStandardMaterial | null = null;
function darkMat() {
  DARK_MAT ??= new THREE.MeshStandardMaterial({
    color: new THREE.Color("#09090b"),
    roughness: 0.22,
    metalness: 0.75,
  });
  return DARK_MAT;
}

function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

const PART_MATERIALS = new Map<PartKey, THREE.MeshStandardMaterial>();

let BODY_MATERIAL: THREE.MeshStandardMaterial | null = null;

function bodyMaterial(): THREE.MeshStandardMaterial {
  BODY_MATERIAL ??= new THREE.MeshStandardMaterial({
    color: new THREE.Color("#232327"),
    roughness: 0.38,
    metalness: 0.55,
  });
  return BODY_MATERIAL;
}

function partMaterial(part: PartKey): THREE.MeshStandardMaterial {
  let m = PART_MATERIALS.get(part);
  if (!m) {
    const mp = PART_MAT[part];
    m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(mp.color),
      roughness: mp.roughness,
      metalness: mp.metalness,
      emissive: new THREE.Color(ACCENT),
      emissiveIntensity: 0,
    });
    PART_MATERIALS.set(part, m);
  }
  return m;
}

/* ------------------------------------------------------------------ */
/* State input bersama (drag & kursor)                                 */
/* ------------------------------------------------------------------ */

const IDLE_AFTER_MS = 3500;
const IDLE_SPIN = 0.1;

export class InputState {
  ty = 0;
  tx = 0;
  lx = -600;
  ly = -600;
  lastMove = 0;

  down() {
    this.lastMove = performance.now();
  }

  pointer(nx: number, ny: number) {
    this.lx = nx;
    this.ly = ny;
    this.lastMove = performance.now();
  }

  drag(dx: number, dy: number) {
    this.ty += dx * 0.006;
    this.tx = THREE.MathUtils.clamp(this.tx + dy * 0.004, -0.45, 0.45);
    this.lastMove = performance.now();
  }

  /* yaw idle pelan setelah lama tanpa sentuhan */
  tick(dt: number) {
    if (performance.now() - this.lastMove > IDLE_AFTER_MS) {
      this.ty += dt * IDLE_SPIN;
    }
  }
}

export function createInput(): InputState {
  return new InputState();
}

/* ------------------------------------------------------------------ */
/* Geometri tiap bagian                                                */
/* ------------------------------------------------------------------ */

function PartGeometry({
  part,
  seg,
  material,
}: {
  part: PartKey;
  seg: number;
  material: THREE.MeshStandardMaterial;
}) {
  switch (part) {
    case "layar":
      return (
        <RoundedBox
          args={[PHONE_W - 0.14, PHONE_H - 0.14, 0.04]}
          radius={0.12}
          smoothness={seg}
          material={material}
        />
      );
    case "kamera":
      return (
        <group>
          <RoundedBox
            args={[0.68, 0.68, 0.06]}
            radius={0.1}
            smoothness={seg}
            material={material}
          />
          <mesh position={[-0.15, 0.15, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.09, seg * 8]} />
            <primitive object={darkMat()} attach="material" />
          </mesh>
          <mesh position={[-0.15, 0.15, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.148, 0.148, 0.018, seg * 8]} />
            <primitive object={accentMat()} attach="material" />
          </mesh>
          <mesh position={[0.18, -0.16, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.09, seg * 8]} />
            <primitive object={darkMat()} attach="material" />
          </mesh>
          <mesh position={[0.18, -0.16, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.018, seg * 8]} />
            <primitive object={accentMat()} attach="material" />
          </mesh>
        </group>
      );
    case "board":
      return (
        <group>
          <mesh material={material}>
            <boxGeometry args={[PHONE_W * 0.74, 0.95, 0.05]} />
          </mesh>
          <mesh position={[-0.26, 0.16, 0.045]}>
            <boxGeometry args={[0.24, 0.24, 0.035]} />
            <primitive object={accentMat()} attach="material" />
          </mesh>
          <mesh position={[0.2, -0.18, 0.045]}>
            <boxGeometry args={[0.17, 0.17, 0.035]} />
            <primitive object={accentMat()} attach="material" />
          </mesh>
        </group>
      );
    case "baterai":
      return (
        <group>
          <mesh material={material}>
            <boxGeometry args={[PHONE_W * 0.62, PHONE_H * 0.34, 0.07]} />
          </mesh>
          <mesh position={[0, PHONE_H * 0.34 / 2 + 0.045, 0]}>
            <boxGeometry args={[PHONE_W * 0.2, 0.05, 0.072]} />
            <primitive object={accentMat()} attach="material" />
          </mesh>
        </group>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Satu bagian beranimasi                                              */
/* ------------------------------------------------------------------ */

interface PartProps {
  part: PartKey;
  index: number;
  exploded: boolean;
  instant: boolean;
  selectedKey: PartKey | null;
  hovered: PartKey | null;
  seg: number;
  onSelect: (p: PartKey | null) => void;
  onHover: (p: PartKey | null) => void;
  lastDown: React.MutableRefObject<{ x: number; y: number }>;
}

function Part({
  part,
  index,
  exploded,
  instant,
  selectedKey,
  hovered,
  seg,
  onSelect,
  onHover,
  lastDown,
}: PartProps) {
  const group = useRef<THREE.Group>(null);
  const prog = useRef(0);
  const wait = useRef(0);

  const material = partMaterial(part);

  useEffect(() => {
    wait.current = !instant && exploded ? index * STAGGER : 0;
  }, [exploded, instant, index]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    const target = exploded ? 1 : 0;
    if (instant) {
      prog.current = target;
    } else if (wait.current > 0) {
      wait.current = wait.current - dt;
    } else {
      const dir = exploded ? 1 : -1;
      const next = prog.current + (dir * dt) / DURATION;
      prog.current = THREE.MathUtils.clamp(next, 0, 1);
    }

    const t = smoothstep(prog.current);
    const pose = POSES[part];
    g.position.set(
      THREE.MathUtils.lerp(pose.assembled.pos[0], pose.exploded.pos[0], t),
      THREE.MathUtils.lerp(pose.assembled.pos[1], pose.exploded.pos[1], t),
      THREE.MathUtils.lerp(pose.assembled.pos[2], pose.exploded.pos[2], t),
    );
    g.rotation.set(
      THREE.MathUtils.lerp(pose.assembled.rot[0], pose.exploded.rot[0], t),
      THREE.MathUtils.lerp(pose.assembled.rot[1], pose.exploded.rot[1], t),
      THREE.MathUtils.lerp(pose.assembled.rot[2], pose.exploded.rot[2], t),
    );

    const isSel = selectedKey === part;
    const isHover = hovered === part;
    const want = isSel ? 0.55 : isHover ? 0.3 : 0;
    const m = PART_MATERIALS.get(part);
    if (m) {
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, want, 9, dt);
    }
  });

  const active = selectedKey === part || hovered === part;

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(part);
      }}
      onPointerOut={() => onHover(null)}
      onPointerUp={(e) => {
        const d = lastDown.current;
        const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
        if (dist < 8) onSelect(selectedKey === part ? null : part);
      }}
    >
      <PartGeometry part={part} seg={seg} material={material} />

      {exploded && (
        <Html
          position={LABEL_POS[part]}
          center
          distanceFactor={7}
          zIndexRange={[30, 10]}
          className="select-none"
        >
          <div
            className={`pointer-events-none rounded-full border px-2 py-0.5 text-[10px] whitespace-nowrap backdrop-blur transition-colors duration-200 ${
              active
                ? "border-blue-500/70 bg-blue-600/30 text-white"
                : "border-white/10 bg-zinc-900/85 text-zinc-300"
            }`}
          >
            {PART_LABELS[part]}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Body HP (anchor, tidak interaktif)                                  */
/* ------------------------------------------------------------------ */

function Body({
  exploded,
  instant,
}: {
  exploded: boolean;
  instant: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const prog = useRef(0);
  const material = bodyMaterial();

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const target = exploded ? 1 : 0;
    prog.current = instant
      ? target
      : THREE.MathUtils.clamp(prog.current + ((exploded ? 1 : -1) * dt) / DURATION, 0, 1);
    m.position.z = THREE.MathUtils.lerp(0, BODY_EXPLODED_Z, smoothstep(prog.current));
  });

  return (
    <mesh ref={mesh} material={material}>
      <RoundedBox
        args={[PHONE_W, PHONE_H, PHONE_D]}
        radius={0.16}
        smoothness={instant ? 2 : 4}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Rakitan lengkap                                                     */
/* ------------------------------------------------------------------ */

interface AssemblyProps {
  exploded: boolean;
  instant: boolean;
  lowPower: boolean;
  selectedKey: PartKey | null;
  hovered: PartKey | null;
  input: React.MutableRefObject<InputState>;
  onSelect: (p: PartKey | null) => void;
  onHover: (p: PartKey | null) => void;
  lastDown: React.MutableRefObject<{ x: number; y: number }>;
}

export function PhoneAssembly({
  exploded,
  instant,
  lowPower,
  selectedKey,
  hovered,
  input,
  onSelect,
  onHover,
  lastDown,
}: AssemblyProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const inp = input.current;

    if (!instant) inp.tick(dt);

    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      inp.ty % (Math.PI * 2),
      7,
      dt,
    );
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, inp.tx, 7, dt);
    g.position.y = instant ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.045;
  });

  const seg = lowPower ? 2 : 4;

  return (
    <group ref={group}>
      <Body exploded={exploded} instant={instant} />
      {PART_ORDER.map((p, i) => (
        <Part
          key={p}
          part={p}
          index={i}
          exploded={exploded}
          instant={instant}
          selectedKey={selectedKey}
          hovered={hovered}
          seg={seg}
          onSelect={onSelect}
          onHover={onHover}
          lastDown={lastDown}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cahaya rim mengikuti kursor                                         */
/* ------------------------------------------------------------------ */

export function CursorLight({ input }: { input: React.MutableRefObject<InputState> }) {
  const light = useRef<THREE.PointLight>(null);

  useFrame((state, dt) => {
    const l = light.current;
    if (!l) return;
    const inp = input.current;
    l.position.x = THREE.MathUtils.damp(l.position.x, inp.lx * 5, 5, dt);
    l.position.y = THREE.MathUtils.damp(l.position.y, inp.ly * 3 + 0.4, 5, dt);
    l.intensity = inp.lx === -600 ? 0 : 26;
    void state;
  });

  return (
    <pointLight
      ref={light}
      color="#4c8dff"
      intensity={0}
      distance={11}
      decay={1.6}
      position={[-4, -1, -2.4]}
    />
  );
}
