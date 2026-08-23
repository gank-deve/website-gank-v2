"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  CHECKLIST_ITEMS,
  ORDER_STATUS_FLOW,
  type OrderStatus,
} from "@/lib/constants";
import { sendStatusNotification } from "@/lib/whatsapp";

export interface OrderFormState {
  error?: string;
  created?: { id: string; code: string };
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  const now = new Date();
  const ym = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `GANK-SVC-${ym}-${suffix}`;
}

export async function createOrder(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  await requireUser();
  const supabase = await createClient();

  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const deviceBrand = String(formData.get("device_brand") ?? "").trim();
  const deviceModel = String(formData.get("device_model") ?? "").trim();
  const imei = String(formData.get("imei") ?? "").trim();
  const complaint = String(formData.get("complaint") ?? "").trim();
  const technicianNote = String(formData.get("technician_note") ?? "").trim();
  const damageTypeIdRaw = String(formData.get("damage_type_id") ?? "");
  const damageTypeId = damageTypeIdRaw ? Number(damageTypeIdRaw) : null;
  const estimatedCost = Number(formData.get("estimated_cost") ?? 0) || 0;

  if (!customerName || !customerPhone || !deviceModel) {
    return { error: "Nama pelanggan, nomor WhatsApp, dan tipe HP wajib diisi." };
  }
  if (!/^\d{8,15}$/.test(customerPhone.replace(/\D/g, ""))) {
    return { error: "Nomor WhatsApp tidak valid (contoh: 081234567890)." };
  }

  const { data: user } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from("service_orders")
    .insert({
      code: generateCode(),
      customer_name: customerName,
      customer_phone: customerPhone,
      device_brand: deviceBrand,
      device_model: deviceModel,
      imei,
      complaint,
      damage_type_id: damageTypeId,
      estimated_cost: estimatedCost,
      technician_note: technicianNote,
      status: "masuk",
      technician_id: user.user?.id ?? null,
    })
    .select("id, code")
    .single();

  if (error) return { error: `Gagal membuat order: ${error.message}` };

  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "masuk",
    note: "Order dibuat",
    changed_by: user.user?.id ?? null,
  });

  revalidatePath("/internal/servis");
  revalidatePath("/internal");

  // Notifikasi WhatsApp otomatis untuk status awal "masuk".
  // Kegagalan pengiriman tidak menggagalkan order (tercatat di log).
  await sendStatusNotification(
    {
      id: order.id,
      code: order.code,
      customer_name: customerName,
      customer_phone: customerPhone,
      device_model: deviceModel,
      final_cost: null,
    },
    "masuk",
  );

  return { created: { id: order.id, code: order.code } };
}

export interface ChecklistEntryInput {
  item_key: string;
  passed: boolean;
  note?: string;
}

export async function saveChecklist(
  orderId: string,
  phase: "awal" | "akhir",
  entries: ChecklistEntryInput[],
): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const validKeys = new Set(CHECKLIST_ITEMS.map((i) => i.key));
  const cleanEntries = entries.filter((e) => validKeys.has(e.item_key));

  if (cleanEntries.length === 0) {
    return { error: "Checklist kosong." };
  }

  // Checklist akhir harus lengkap semua item sebelum boleh disimpan
  if (phase === "akhir" && cleanEntries.length < CHECKLIST_ITEMS.length) {
    return { error: "Semua item checklist akhir harus diisi." };
  }

  const rows = cleanEntries.map((e) => ({
    order_id: orderId,
    phase,
    item_key: e.item_key,
    passed: e.passed,
    note: e.note ?? "",
    checked_by: user.id,
  }));

  const { error } = await supabase
    .from("service_checklists")
    .upsert(rows, { onConflict: "order_id,phase,item_key" });

  if (error) return { error: `Gagal menyimpan checklist: ${error.message}` };

  revalidatePath(`/internal/servis/${orderId}`);
  return {};
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireUser();

  if (!ORDER_STATUS_FLOW.includes(nextStatus)) {
    return { error: "Status tidak valid." };
  }

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("service_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order tidak ditemukan." };

  // GATE KONSISTENSI: status 'selesai' wajib melewati checklist fungsional
  // akhir yang lengkap. Divalidasi ulang di sini meski DB juga menjaga.
  if (nextStatus === "selesai" && order.status !== "selesai") {
    const { count } = await supabase
      .from("service_checklists")
      .select("item_key", { count: "exact", head: true })
      .eq("order_id", orderId)
      .eq("phase", "akhir");

    if ((count ?? 0) < CHECKLIST_ITEMS.length) {
      return {
        error: `Checklist fungsional akhir belum lengkap (${count ?? 0}/${CHECKLIST_ITEMS.length}). Isi checklist terlebih dahulu.`,
      };
    }
  }

  const { error: updErr } = await supabase
    .from("service_orders")
    .update({ status: nextStatus })
    .eq("id", orderId);

  if (updErr) return { error: `Gagal memperbarui status: ${updErr.message}` };

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: nextStatus,
    note: "",
    changed_by: user.id,
  });

  revalidatePath(`/internal/servis/${orderId}`);
  revalidatePath("/internal/servis");
  revalidatePath("/internal");

  // Notifikasi WhatsApp otomatis untuk setiap perubahan status.
  // Tidak menggagalkan operasi utama bila pengiriman gagal (tercatat di log).
  await sendStatusNotification(
    {
      id: order.id,
      code: order.code,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      device_model: order.device_model,
      final_cost: order.final_cost,
    },
    nextStatus,
  );

  return { success: true };
}

export async function updateOrderCosts(
  orderId: string,
  estimatedCost: number,
  finalCost: number | null,
): Promise<{ error?: string }> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("service_orders")
    .update({ estimated_cost: estimatedCost, final_cost: finalCost })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath(`/internal/servis/${orderId}`);
  return {};
}

export async function retryNotification(
  orderId: string,
): Promise<{ error?: string; success?: boolean }> {
  await requireUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("service_orders")
    .select("id, code, customer_name, customer_phone, device_model, final_cost, status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order tidak ditemukan." };

  await sendStatusNotification(order, order.status as OrderStatus);
  revalidatePath(`/internal/servis/${orderId}`);
  return { success: true };
}
