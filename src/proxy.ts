import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedApi = pathname.startsWith("/api/orders") || pathname.startsWith("/api/config");

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(process.env.SESSION_SECRET ?? "", token);

  if (valid) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized — silakan login sebagai admin." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/config",
    "/api/config/:path*",
  ],
  // Exclude static files, images, fonts, etc
  skipped: [
    "/((?!api|admin).*)",
    "/favicon.png",
    "/manifest.json",
    "/robots.txt",
  ],
};
