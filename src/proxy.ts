import { type NextRequest, NextResponse } from "next/server";

import { decrypt, SESSION_COOKIE } from "@/lib/session";

const protectedPrefixes = ["/dashboard", "/admin"];
const authRoutes = ["/login"];

// 쿠키만 읽는 낙관적 검사. 실제 인가(관리자 여부 포함)는 getCurrentUser()/requireAdmin()에서 DB로 다시 한다.
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = protectedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (authRoutes.includes(path) && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
