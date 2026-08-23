import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client dengan hak akses penuh (service role) — HANYA untuk operasi
 * server-side tertentu yang butuh melewati RLS, mis. Storage file.
 * Jangan pernah mengimpornya dari kode client.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SECRET_KEY belum diisi di .env.local — dibutuhkan untuk operasi storage.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
