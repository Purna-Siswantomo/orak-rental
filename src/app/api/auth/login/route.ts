import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, timingSafeEqual, SESSION_COOKIE_NAME } from "@/lib/session";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 hari

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Body request bukan JSON yang valid." }, { status: 400 });
  }

  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!expectedPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD/SESSION_SECRET belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  const usernameOk = timingSafeEqual(body.username ?? "", expectedUsername);
  const passwordOk = timingSafeEqual(body.password ?? "", expectedPassword);

  if (!usernameOk || !passwordOk) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  const token = await createSessionToken(sessionSecret, SESSION_MAX_AGE_SECONDS);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
