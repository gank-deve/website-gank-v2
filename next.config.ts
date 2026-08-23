import type { NextConfig } from "next";

// Domain tambahan (bisa wildcard subdomain, mis. "*.app.example.dev") untuk
// origin yang diizinkan memanggil Server Actions saat mismatch dengan host —
// berguna bila aplikasi diakses lewat port-forwarding/reverse proxy.
// Pisahkan dengan koma lewat env SERVER_ACTIONS_ALLOWED_ORIGINS.
const extraOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Foto unit dari Supabase Storage
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: extraOrigins.length > 0 ? extraOrigins : undefined,
    },
  },
};

export default nextConfig;
