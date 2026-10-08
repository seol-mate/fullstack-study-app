import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import type { SessionPayload } from "@/lib/definitions";

export const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, getKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return undefined;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ userId, expiresAt: expires.toISOString() });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  return decrypt(cookie);
}
