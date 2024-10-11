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
  const sessionCookie = request.cookies.get("session")?.value;
  const isProtected = isProtectedRoute(request);

  // Redirect to login if accessing protected route without session
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL(AUTH_ROUTE, request.url));
  }

  const res = NextResponse.next();

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie);
      const newExpiresAt = getExpireAt();

      // Update session cookie
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
      // Log error and delete invalid session
      console.error(
        "Session error:",
        error instanceof Error ? `${error.name}: ${error.message}` : error
      );
      res.cookies.delete("session");

      // Redirect to login if on protected route
      if (isProtected) {
        return NextResponse.redirect(new URL(AUTH_ROUTE, request.url));
      }
    }
  }

  return res;
}
