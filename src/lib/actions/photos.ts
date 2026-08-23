"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

const BUCKET = "phone-photos";
const MAX_PHOTOS = 8;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function pathFromUrl(url: string) {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

async function currentPhotos(supabase: Awaited<ReturnType<typeof createClient>>, listingId: string) {
  const { data } = await supabase
    .from("phone_listings")
    .select("photos")
    .eq("id", listingId)
    .single();
  return (data?.photos as string[] | null) ?? [];
}

async function savePhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  photos: string[],
) {
  await supabase.from("phone_listings").update({ photos }).eq("id", listingId);
  revalidatePath("/internal/stok");
  revalidatePath("/katalog");
  revalidatePath("/");
}

export async function uploadListingPhotos(
  listingId: string,
  formData: FormData,
): Promise<{ error?: string; urls?: string[] }> {
  await requireAdmin();
  const supabase = await createClient();
  // Storage memakai service client agar tidak bergantung pada policy
  // storage.objects — kredensialnya tetap server-only.
  let storage: ReturnType<typeof createServiceClient>;
  try {
    storage = createServiceClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Konfigurasi storage belum siap." };
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Tidak ada file yang dipilih." };

  const existing = await currentPhotos(supabase, listingId);
  if (existing.length + files.length > MAX_PHOTOS) {
    return { error: `Maksimal ${MAX_PHOTOS} foto per unit (saat ini ${existing.length}).` };
  }

  const urls: string[] = [];
  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return { error: `Format ${file.type || file.name} tidak didukung. Gunakan JPG/PNG/WebP.`, urls };
    }
    if (file.size > MAX_SIZE) {
      return { error: `${file.name} melebihi batas 5 MB.`, urls };
    }

    const path = `${listingId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const body = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await storage
      .storage
      .from(BUCKET)
      .upload(path, body, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (upErr) {
      return { error: `Gagal unggah: ${upErr.message}`, urls };
    }

    const { data } = storage.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  const next = [...existing, ...urls];
  await savePhotos(supabase, listingId, next);
  return { urls };
}

export async function removeListingPhoto(
  listingId: string,
  url: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const existing = await currentPhotos(supabase, listingId);
  const next = existing.filter((p) => p !== url);

  const path = pathFromUrl(url);
  if (path) {
    try {
      await createServiceClient().storage.from(BUCKET).remove([path]);
    } catch {
      // DB tetap diperbarui walau file fisik gagal dihapus
    }
  }

  await savePhotos(supabase, listingId, next);
  return {};
}

/** Pindahkan foto ke posisi pertama (menjadi cover katalog). */
export async function setPrimaryPhoto(
  listingId: string,
  url: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const existing = await currentPhotos(supabase, listingId);
  if (!existing.includes(url)) return { error: "Foto tidak ditemukan." };

  await savePhotos(supabase, listingId, [url, ...existing.filter((p) => p !== url)]);
  return {};
}
