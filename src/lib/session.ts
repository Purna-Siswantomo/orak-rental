// Session token sederhana: payload (waktu kedaluwarsa) + tanda tangan HMAC-SHA256.
// Pakai Web Crypto (bukan modul `crypto` Node) supaya jalan baik di middleware (Edge runtime)
// maupun di API route (Node runtime) — global `crypto.subtle` tersedia di keduanya.

const encoder = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const SESSION_COOKIE_NAME = "admin_session";

export async function createSessionToken(secret: string, maxAgeSeconds: number): Promise<string> {
  const expires = Date.now() + maxAgeSeconds * 1000;
  const payload = String(expires);
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(signature)}`;
}

export async function verifySessionToken(
  secret: string,
  token: string | undefined | null
): Promise<boolean> {
  if (!token || !secret) return false;
  const [payload, signatureHex] = token.split(".");
  if (!payload || !signatureHex) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const key = await getKey(secret);
  const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return timingSafeEqual(toHex(expectedSignature), signatureHex);
}
