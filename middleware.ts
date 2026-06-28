import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/sign-in" || pathname === "/sign-up") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/sign-in", "/sign-up"],
};
