import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "teknisi";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? "",
    role: (profile?.role as "admin" | "teknisi") ?? "teknisi",
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/internal/login");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/internal");
  return user;
}
