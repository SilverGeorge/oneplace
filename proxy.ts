import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

async function hasValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const protectedPaths = ["/dashboard", "/profile"];
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
  if (!isProtectedPath) return NextResponse.next();

  // Temporary preview bypass for onboarding/testing flows.
  if (
    req.nextUrl.pathname.startsWith("/dashboard") &&
    req.nextUrl.searchParams.get("preview") === "1"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = await hasValidToken(token);
  if (isAuthenticated) return NextResponse.next();

  const loginUrl = new URL("/auth/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"]
};
