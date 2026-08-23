"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface ListingFormState {
  error?: string;
  success?: boolean;
}

function parseListingForm(formData: FormData) {
  return {
    brand: String(formData.get("brand") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    storage: String(formData.get("storage") ?? "").trim(),
    ram: String(formData.get("ram") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    condition_grade: String(formData.get("condition_grade") ?? "baik"),
    price: Number(String(formData.get("price") ?? "0").replace(/\D/g, "")) || 0,
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? "available"),
    photos: String(formData.get("photos") ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export async function createListing(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  await requireAdmin();
  const supabase = await createClient();
  const data = parseListingForm(formData);

  if (!data.brand || !data.model || data.price <= 0) {
    return { error: "Brand, model, dan harga wajib diisi dengan benar." };
  }

  const { error } = await supabase.from("phone_listings").insert(data);
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  revalidatePath("/internal/stok");
  revalidatePath("/katalog");
  revalidatePath("/");
  return { success: true };
}

export async function updateListing(
  id: string,
  formData: FormData,
): Promise<ListingFormState> {
  await requireAdmin();
  const supabase = await createClient();
  const data = parseListingForm(formData);

  if (!data.brand || !data.model || data.price <= 0) {
    return { error: "Brand, model, dan harga wajib diisi dengan benar." };
  }

  const { error } = await supabase
    .from("phone_listings")
    .update(data)
    .eq("id", id);

  if (error) return { error: `Gagal memperbarui: ${error.message}` };

  revalidatePath("/internal/stok");
  revalidatePath("/katalog");
  return { success: true };
}

export async function setListingStatus(
  id: string,
  status: "available" | "sold" | "hidden",
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("phone_listings")
    .update({ status })
    .eq("id", id);

  if (error) return;

  revalidatePath("/internal/stok");
  revalidatePath("/katalog");
}
