import { NextRequest, NextResponse } from 'next/server';

/**
 * Get user role from cookies/session
 * In production, consider validating the JWT token instead
 */
function getUserRoleFromCookie(request: NextRequest): string | null {
  // This would be set by your auth library when user logs in
  // For now, we rely on Client Component to fetch full user data
  const sessionCookie = request.cookies.get('better-auth.session_token');
  const secureSessionCookie = request.cookies.get(
    '__Secure-better-auth.session_token'
  );

  return sessionCookie || secureSessionCookie ? 'authenticated' : null;
}

/**
 * Middleware to protect routes and handle authentication-based redirects
 *
 * This runs BEFORE the page loads on the server, preventing UI flicker entirely.
 *
 * ✅ What it does:
 * - Blocks unauthenticated access to /candidate/* and /employer/* routes
 * - Redirects public guest routes to role-specific paths when user is authenticated
 * - Never renders wrong UI to users
 *
 * ⚠️  Limitations:
 * - Cannot read detailed role info from cookies (would require JWT verification)
 * - Client Component (ClientLayout) still fetches full user data for RoleContext
 * - Role-specific redirects happen on client after user data is loaded
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = getUserRoleFromCookie(request);

  // === STEP 1: Protect authentication-required routes ===
  const protectedRoutes = ['/candidate', '/employer'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login BEFORE page renders (prevents protected UI from showing)
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // === STEP 2: Redirect authenticated users from guest-only routes ===
  // Only redirect specific guest routes (not '/') - role-aware redirect happens on client
  // This prevents redirect loops after logout when role is unknown
  if (isAuthenticated) {
    const guestOnlyRoutes = ['/find-jobs', '/browse-companies'];

    for (const guestPath of guestOnlyRoutes) {
      if (pathname === guestPath || pathname.startsWith(guestPath + '/')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // === STEP 3: Allow all other routes ===
  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 * This executes early in the request lifecycle, preventing UI flicker
 */
export const config = {
  matcher: [
    // Protect all candidate routes
    '/candidate/:path*',
    // Protect all employer routes
    '/employer/:path*',
    // Match all routes to allow them through
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
