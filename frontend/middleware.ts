import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const pathname = request.nextUrl.pathname;

    // Redirect "/" based on auth
    if (pathname === "/") {
      const redirectUrl = token ? "/profile" : "/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Optional: protect /profile
    if (pathname.startsWith("/profile") && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile"],
};
