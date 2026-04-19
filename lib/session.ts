// Web-Crypto based HMAC so the middleware can run on the Edge runtime.
// Shared by lib/auth.ts (Node) and middleware.ts (Edge).

const enc = new TextEncoder();

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

export function sessionSecret(env: Record<string, string | undefined>) {
  return env.APP_SESSION_SECRET || env.APP_PASSWORD || "dev-insecure-secret";
}

export async function sign(value: string, secret: string) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return `${value}.${toHex(sig)}`;
}

export async function verify(signed: string | undefined, secret: string) {
  if (!signed) return false;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return false;
  const value = signed.slice(0, idx);
  const expected = await sign(value, secret);
  return expected === signed;
}

export const SESSION_COOKIE = "kilo_control_session";
