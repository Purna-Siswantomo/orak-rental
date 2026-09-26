import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const LOGIN_PATH = "/admin/login";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedApi = pathname.startsWith("/api/orders") || pathname.startsWith("/api/config");

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(process.env.SESSION_SECRET ?? "", token);

  // Halaman login sendiri harus bisa diakses tanpa sesi — kalau tidak, redirect ke
  // /admin/login akan kena proxy lagi dan terjadi redirect loop tanpa akhir.
  if (pathname === LOGIN_PATH) {
    // Sudah login -> langsung ke dashboard, tidak perlu lihat form login lagi.
    if (valid) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (valid) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized — silakan login sebagai admin." }, { status: 401 });
  }

  const loginUrl = new URL(LOGIN_PATH, req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

// Matcher sudah membatasi proxy hanya ke route admin & API terproteksi, jadi aset statis
// (gambar, favicon, _next/*) otomatis tidak ikut diproses.
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/config",
    "/api/config/:path*",
  ],
};
