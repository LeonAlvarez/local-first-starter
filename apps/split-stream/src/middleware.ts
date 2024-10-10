import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTE = '/dashboard';
const AUTH_ROUTE = '/auth/login'

function isProtectedRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return pathname.startsWith(PROTECTED_ROUTE);
}

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('authToken')?.value;

  if (isProtectedRoute(request) && !authToken) {
    return NextResponse.redirect(new URL(AUTH_ROUTE, request.url));
  }

  return NextResponse.next();
}