import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionSecret, verify } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/login", "/api/login", "/api/health"];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  const secret = sessionSecret(process.env as Record<string, string | undefined>);
  const authed = await verify(req.cookies.get(SESSION_COOKIE)?.value, secret);
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
