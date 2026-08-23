import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const INTERNAL_PREFIX = "/internal";
const LOGIN_PATH = "/internal/login";

function firstForwardedHost(headers: Headers) {
  const raw = headers.get("x-forwarded-host");
  return raw?.split(",")[0]?.trim();
}

/**
 * Selaraskan `x-forwarded-host` dengan origin browser HANYA bila origin
 * identik dengan header `Host` yang benar-benar diterima server.
 *
 * Pola ini terjadi saat aplikasi dilewatkan port-forwarding yang menimpa
 * Host menjadi localhost tetapi mengisi x-forwarded-host dengan domain
 * tunnel — validasi CSRF Server Actions membandingkan origin vs
 * x-forwarded-host sehingga gagal meski request sesungguhnya same-origin.
 *
 * Origin lintas-situs (beda dari Host) tidak pernah diselaraskan, sehingga
 * proteksi CSRF bawaan Next.js tetap utuh.
 */
function alignForwardedHost(headers: Headers) {
  const origin = headers.get("origin");
  if (!origin || origin === "null") return;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return;
  }

  if (firstForwardedHost(headers) === originHost) return;

  if (headers.get("host") !== originHost) return;

  headers.set("x-forwarded-host", originHost);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Tanpa kredensial Supabase, biarkan halaman menampilkan panduan konfigurasi.
  if (!hasSupabaseEnv() || !pathname.startsWith(INTERNAL_PREFIX)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  alignForwardedHost(requestHeaders);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          requestHeaders.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === LOGIN_PATH;

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/internal";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/internal/:path*"],
};
