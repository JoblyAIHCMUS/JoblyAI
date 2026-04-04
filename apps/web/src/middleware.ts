import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect routes based on authentication status
 * 
 * This runs BEFORE the page loads, preventing UI flicker entirely.
 * Protected routes:
 * - /candidate/* - requires authentication
 * - /employer/* - requires authentication
 * 
 * Unauthenticated users are redirected to /login before any page renders
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/candidate', '/employer'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for authentication session
    // better-auth uses these cookie names for sessions
    const sessionCookie = request.cookies.get('better-auth.session_token');
    const secureSessionCookie = request.cookies.get(
      '__Secure-better-auth.session_token'
    );

    // If no session found, redirect to login BEFORE page renders
    if (!sessionCookie && !secureSessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 * This executes early in the request lifecycle, preventing UI flicker
 */
export const config = {
  matcher: [
    // Protect all candidate routes
    '/candidate',
    '/candidate/:path*',
    // Protect all employer routes
    '/employer',
    '/employer/:path*',
  ],
};

