import { getExpireAt, getSignedSessionToken, verifyToken } from "core/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTE = "/dashboard";
const AUTH_ROUTE = "/auth/login";

function isProtectedRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return pathname.startsWith(PROTECTED_ROUTE);
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");

  if (isProtectedRoute(request) && !sessionCookie) {
    return NextResponse.redirect(new URL(AUTH_ROUTE, request.url));
  }

  const res = NextResponse.next();

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const newExpiresAt = getExpireAt();

      res.cookies.set({
        name: "session",
        value: await getSignedSessionToken({
          ...parsed,
          expiresAt: newExpiresAt.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: newExpiresAt,
      });
    } catch (error) {
      console.error(
        "Errror details:",
        error instanceof Error ? error.name : "Unknown",
        error instanceof Error ? error.message : error
      );

      res.cookies.delete("session");

      if (isProtectedRoute(request)) {
        return NextResponse.redirect(new URL(AUTH_ROUTE, request.url));
      }
    }
  }

  return;
}
