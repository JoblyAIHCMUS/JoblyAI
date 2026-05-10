import { NextRequest, NextResponse } from 'next/server';

/**
 * Get user role from cookies
 * Backend sets 'user-role' cookie during auth (sign-in/sign-up)
 */
function getUserRole(request: NextRequest): string | null {
  const roleFromCookie = request.cookies.get('user-role')?.value;
  if (
    roleFromCookie &&
    ['admin', 'employer', 'candidate', 'superAdmin'].includes(roleFromCookie)
  ) {
    return roleFromCookie;
  }
  return null;
}

/**
 * Check if user has valid session
 */
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('better-auth.session_token');
  const secureSessionCookie = request.cookies.get(
    '__Secure-better-auth.session_token'
  );
  return !!(sessionCookie || secureSessionCookie);
}

/**
 * Middleware to protect routes and handle authentication-based redirects
 *
 * This runs BEFORE the page loads on the server, preventing UI flicker entirely.
 *
 * ✅ What it does:
 * - Redirect "/" to role-specific dashboard when user is authenticated
 * - Blocks unauthenticated access to /candidate/* and /employer/* routes
 * - Redirects authenticated users away from guest-only routes
 * - All redirects happen server-side → no hydration mismatch
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authenticated = isAuthenticated(request);
  const userRole = getUserRole(request);

  // === STEP 1: Redirect "/" to role-specific dashboard ===
  if (pathname === '/' && authenticated && userRole) {
    const dashboardPath = userRole === 'employer' ? '/employer' : '/candidate';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // === STEP 1B: Redirect /candidate → /candidate/dashboard ===
  if (pathname === '/candidate' && authenticated) {
    return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
  }

  // === STEP 1C: Redirect /employer → /employer/dashboard ===
  if (pathname === '/employer' && authenticated) {
    return NextResponse.redirect(new URL('/employer/dashboard', request.url));
  }

  // === STEP 2: Protect authentication-required routes ===
  const protectedRoutes = ['/candidate', '/employer'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !authenticated) {
    // Redirect to login BEFORE page renders (prevents protected UI from showing)
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // === STEP 3: Redirect authenticated users from guest-only routes ===
  // Redirect back to "/" (which will then redirect to their dashboard in STEP 1)
  if (authenticated) {
    const guestOnlyRoutes = ['/find-jobs', '/browse-companies'];

    for (const guestPath of guestOnlyRoutes) {
      if (pathname === guestPath || pathname.startsWith(guestPath + '/')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // === STEP 4: Allow all other routes ===
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
    // Match "/" for role-based redirect
    '/',
    // Match all routes to allow them through
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
