export const BRAND = {
  name: "GANK.",
  slogan: "Jujur. Cepat. Transparan.",
  waNumber: process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890",
  address:
    process.env.NEXT_PUBLIC_ADDRESS ?? "Jl. Teknologi No. 88, Jakarta Selatan",
  hours: "Senin–Sabtu, 09.00–20.00 WIB",
} as const;

export type OrderStatus =
  | "masuk"
  | "diperiksa"
  | "menunggu_acc"
  | "proses"
  | "selesai"
  | "diambil"
  | "batal";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "masuk",
  "diperiksa",
  "menunggu_acc",
  "proses",
  "selesai",
  "diambil",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  masuk: "Masuk",
  diperiksa: "Diperiksa",
  menunggu_acc: "Menunggu ACC Pelanggan",
  proses: "Proses Servis",
  selesai: "Selesai",
  diambil: "Sudah Diambil",
  batal: "Batal",
};

export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "accent" | "info" | "warning" | "success" | "danger" | "neutral"
> = {
  masuk: "info",
  diperiksa: "info",
  menunggu_acc: "warning",
  proses: "accent",
  selesai: "success",
  diambil: "neutral",
  batal: "danger",
};

export type ChecklistPhase = "awal" | "akhir";

export interface ChecklistItemDef {
  key: string;
  label: string;
}

export const CHECKLIST_ITEMS: ChecklistItemDef[] = [
  { key: "layar_touchscreen", label: "Layar & Touchscreen" },
  { key: "kamera_belakang", label: "Kamera Belakang" },
  { key: "kamera_depan", label: "Kamera Depan" },
  { key: "speaker", label: "Speaker" },
  { key: "microphone", label: "Microphone" },
  { key: "audio_jack", label: "Audio Jack" },
  { key: "wifi_bluetooth", label: "WiFi & Bluetooth" },
  { key: "signal_sim", label: "Sinyal & SIM" },
  { key: "charging_port", label: "Port Charging" },
  { key: "baterai", label: "Kondisi Baterai" },
  { key: "biometrik", label: "Face ID / Fingerprint" },
  { key: "tombol_fisik", label: "Tombol Fisik" },
];

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}
