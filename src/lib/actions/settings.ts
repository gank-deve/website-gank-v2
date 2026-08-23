"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendTestMessage } from "@/lib/whatsapp";

export interface TestWaState {
  ok?: boolean;
  message?: string;
  pendingNumber?: string;
}

export async function testWhatsApp(
  _prev: TestWaState,
  formData: FormData,
): Promise<TestWaState> {
  await requireAdmin();

  const number = String(formData.get("test_number") ?? "").trim();
  if (!/^\d{8,15}$/.test(number.replace(/\D/g, ""))) {
    return { ok: false, message: "Nomor tidak valid. Contoh: 081234567890" };
  }

  const result = await sendTestMessage(number);
  revalidatePath("/internal/pengaturan");
  return { ...result, pendingNumber: number };
}

export interface PasswordState {
  ok?: boolean;
  message?: string;
}

export async function changePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  await requireUser();
  const supabase = await createClient();

  const password = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "Password minimal 8 karakter." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Konfirmasi password tidak cocok." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: `Gagal mengubah password: ${error.message}` };
  }

  revalidatePath("/internal/pengaturan");
  return { ok: true, message: "Password berhasil diubah. Gunakan password baru pada login berikutnya." };
}
