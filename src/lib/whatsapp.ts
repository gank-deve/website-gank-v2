import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/constants";

const GRAPH_URL = "https://graph.facebook.com";

function config() {
  return {
    enabled: process.env.WHATSAPP_ENABLED === "true",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    version: process.env.WHATSAPP_GRAPH_VERSION ?? "v23.0",
    templateStatus: process.env.WHATSAPP_TEMPLATE_STATUS ?? "gank_status_update",
    templateDone: process.env.WHATSAPP_TEMPLATE_DONE ?? "gank_service_done",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}

interface OrderForNotify {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  final_cost?: number | null;
}

export interface WhatsAppConfigStatus {
  enabled: boolean;
  phoneNumberIdSet: boolean;
  accessTokenSet: boolean;
  templateStatus: string;
  templateDone: string;
}

export function getWhatsAppConfigStatus(): WhatsAppConfigStatus {
  const cfg = config();
  return {
    enabled: cfg.enabled,
    phoneNumberIdSet: cfg.phoneNumberId.length > 0,
    accessTokenSet: cfg.accessToken.length > 0,
    templateStatus: cfg.templateStatus,
    templateDone: cfg.templateDone,
  };
}

/**
 * Kirim template `hello_world` bawaan Meta untuk memverifikasi kredensial
 * dan konektivitas tanpa perlu template kustom sudah di-approve.
 */
export async function sendTestMessage(
  toNumber: string,
): Promise<{ ok: boolean; message: string }> {
  const cfg = config();

  if (!cfg.phoneNumberId || !cfg.accessToken) {
    return {
      ok: false,
      message: "WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN belum diisi di .env.local",
    };
  }

  try {
    const res = await fetch(
      `${GRAPH_URL}/${cfg.version}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toNumber.replace(/\D/g, "").replace(/^0/, "62"),
          type: "template",
          template: { name: "hello_world", language: { code: "en_US" } },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      let hint = errBody.slice(0, 300);
      try {
        const j = JSON.parse(errBody);
        hint = j?.error?.message ?? hint;
      } catch {
        // biarkan teks mentah
      }
      return { ok: false, message: `HTTP ${res.status}: ${hint}` };
    }

    return { ok: true, message: "Pesan tes hello_world terkirim — cek WhatsApp tujuan!" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Kesalahan jaringan tak diketahui",
    };
  }
}

/**
 * Sends a WhatsApp Business template message via the Meta Cloud API.
 * Never throws — all outcomes are recorded in `notification_logs`.
 */
export async function sendStatusNotification(
  order: OrderForNotify,
  newStatus: OrderStatus,
): Promise<void> {
  const cfg = config();
  const supabase = await createClient();

  const log = async (status: "sent" | "failed" | "skipped", error?: string) => {
    await supabase.from("notification_logs").insert({
      order_id: order.id,
      channel: "whatsapp",
      destination: order.customer_phone,
      template: newStatus === "selesai" ? cfg.templateDone : cfg.templateStatus,
      status,
      error: error ?? null,
    });
  };

  if (!cfg.enabled) {
    await log("skipped", "WHATSAPP_ENABLED=false");
    return;
  }

  if (!cfg.phoneNumberId || !cfg.accessToken) {
    await log("failed", "Kredensial WhatsApp belum dikonfigurasi");
    return;
  }

  const trackingUrl = `${cfg.appUrl}/tracking?code=${encodeURIComponent(order.code)}`;
  const isDone = newStatus === "selesai";
  const templateName = isDone ? cfg.templateDone : cfg.templateStatus;

  // Body params match the approved Meta message templates:
  // gank_status_update: {{1}} nama, {{2}} perangkat, {{3}} kode order,
  //                     {{4}} status baru, {{5}} link tracking
  // gank_service_done:  {{1}} nama, {{2}} perangkat, {{3}} kode order,
  //                     {{4}} estimasi biaya, {{5}} link tracking
  const bodyParams = [
    { type: "text", text: order.customer_name },
    { type: "text", text: order.device_model },
    { type: "text", text: order.code },
    {
      type: "text",
      text: isDone
        ? `Rp${(order.final_cost ?? 0).toLocaleString("id-ID")}`
        : ORDER_STATUS_LABEL[newStatus],
    },
    { type: "text", text: trackingUrl },
  ];

  try {
    const res = await fetch(
      `${GRAPH_URL}/${cfg.version}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: order.customer_phone.replace(/\D/g, "").replace(/^0/, "62"),
          type: "template",
          template: {
            name: templateName,
            language: { code: "id" },
            components: [
              { type: "body", parameters: bodyParams },
            ],
          },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      await log("failed", `HTTP ${res.status}: ${errBody.slice(0, 400)}`);
      return;
    }

    await log("sent");
  } catch (err) {
    await log("failed", err instanceof Error ? err.message : "Unknown error");
  }
}
