import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionSecret, sign, verify } from "./session";

function secret() {
  return sessionSecret(process.env as Record<string, string | undefined>);
}

export async function isAuthed() {
  const store = await cookies();
  return verify(store.get(SESSION_COOKIE)?.value, secret());
}

export async function login(password: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error("APP_PASSWORD not configured");
  if (password !== expected) return false;
  const store = await cookies();
  const value = await sign(`ok-${Date.now()}`, secret());
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
