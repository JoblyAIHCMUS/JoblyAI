import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

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
function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.get(name)?.value);
}

async function validateSession(
  request: NextRequest
): Promise<{ authenticated: boolean; shouldClear: boolean }> {
  if (!hasSessionCookie(request)) {
    return { authenticated: false, shouldClear: false };
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return { authenticated: true, shouldClear: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (response.ok) {
      try {
        const payload = (await response.json()) as {
          data?: { session?: unknown; user?: { id?: string } | null };
          session?: unknown;
          user?: { id?: string } | null;
        };
        const session =
          payload?.data?.session ?? payload?.session ?? payload?.data?.user;
        const user = payload?.data?.user ?? payload?.user;
        const hasSession = Boolean(session || user?.id);
        if (!hasSession) {
          return { authenticated: false, shouldClear: true };
        }
        return { authenticated: true, shouldClear: false };
      } catch {
        return { authenticated: true, shouldClear: false };
      }
    }

    if (response.status === 401 || response.status === 403) {
      return { authenticated: false, shouldClear: true };
    }

    return { authenticated: true, shouldClear: false };
  } catch {
    return { authenticated: true, shouldClear: false };
  }
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('user-role', '', {
    path: '/',
    sameSite: 'lax',
    maxAge: 0,
  });
  response.cookies.set('better-auth.session_token', '', {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 0,
  });
  response.cookies.set('__Secure-better-auth.session_token', '', {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
    maxAge: 0,
  });
}

function logRedirect(
  reason: string,
  pathname: string,
  authenticated: boolean,
  userRole: string | null,
  hasCookie: boolean,
  shouldClear: boolean
) {
  console.log(
    `[MW] redirect reason=${reason} path=${pathname} auth=${authenticated} role=${
      userRole ?? 'none'
    } hasCookie=${hasCookie} clearCookies=${shouldClear}`
  );
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
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasCookie = hasSessionCookie(request);
  const guestOnlyRoutes = ['/find-jobs', '/browse-companies'];
  const isGuestOnlyRoute = guestOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const protectedRoutes = ['/candidate', '/employer'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const shouldCheckSession =
    hasCookie &&
    (pathname === '/' || isGuestOnlyRoute || isProtectedRoute);

  const authState = shouldCheckSession
    ? await validateSession(request)
    : { authenticated: hasCookie, shouldClear: false };
  const authenticated = authState.authenticated;
  const userRole = authenticated ? getUserRole(request) : null;
  if (authenticated && !userRole) {
    authState.shouldClear = true;
  }
  const applyCookieCleanup = (response: NextResponse) => {
    if (authState.shouldClear) {
      console.warn(
        `[MW] clearing auth cookies path=${pathname} hasCookie=${hasCookie}`
      );
      clearAuthCookies(response);
    }
    return response;
  };

  // === STEP 1: Redirect "/" to role-specific dashboard ===
  if (pathname === '/' && authenticated && userRole) {
    const dashboardPath = userRole === 'employer' ? '/employer' : '/candidate';
    logRedirect(
      'root-to-dashboard',
      pathname,
      authenticated,
      userRole,
      hasCookie,
      authState.shouldClear
    );
    return applyCookieCleanup(
      NextResponse.redirect(new URL(dashboardPath, request.url))
    );
  }

  // === STEP 1B: Redirect /candidate → /candidate/dashboard ===
  if (pathname === '/candidate' && authenticated) {
    logRedirect(
      'candidate-root-to-dashboard',
      pathname,
      authenticated,
      userRole,
      hasCookie,
      authState.shouldClear
    );
    return applyCookieCleanup(
      NextResponse.redirect(new URL('/candidate/dashboard', request.url))
    );
  }

  // === STEP 1C: Redirect /employer → /employer/dashboard ===
  if (pathname === '/employer' && authenticated) {
    logRedirect(
      'employer-root-to-dashboard',
      pathname,
      authenticated,
      userRole,
      hasCookie,
      authState.shouldClear
    );
    return applyCookieCleanup(
      NextResponse.redirect(new URL('/employer/dashboard', request.url))
    );
  }

  // === STEP 2: Protect authentication-required routes ===
  if (isProtectedRoute && !authenticated) {
    logRedirect(
      'protected-route-guest',
      pathname,
      authenticated,
      userRole,
      hasCookie,
      authState.shouldClear
    );
    // Redirect to login BEFORE page renders (prevents protected UI from showing)
    return applyCookieCleanup(
      NextResponse.redirect(new URL('/login', request.url))
    );
  }

  // === STEP 3: Redirect authenticated users from guest-only routes ===
  // For candidates: redirect /find-jobs → /candidate/find-jobs, /browse-companies → /candidate/browse-companies
  // For employers: redirect to dashboard (not allowed to access these guest routes)
  if (authenticated && userRole) {
    for (const guestPath of guestOnlyRoutes) {
      if (pathname === guestPath || pathname.startsWith(guestPath + '/')) {
        let redirectPath: string;

        if (userRole === 'candidate') {
          // Candidates can view these routes, but from their role-specific path
          redirectPath = `/candidate${pathname}`;
        } else {
          // Employers and other roles redirect to dashboard
          redirectPath = '/';
        }

        logRedirect(
          'guest-only-authenticated',
          pathname,
          authenticated,
          userRole,
          hasCookie,
          authState.shouldClear
        );
        return applyCookieCleanup(
          NextResponse.redirect(new URL(redirectPath, request.url))
        );
      }
    }
  }

  // === STEP 4: Allow all other routes ===
  return applyCookieCleanup(NextResponse.next());
}

/**
 * Configure which routes the middleware runs on
 * This executes early in the request lifecycle, preventing UI flicker
 */
export const config = {
  matcher: [
    // Root path
    '/',
    // Guest-only routes (for redirect logic)
    '/find-jobs/:path*',
    '/browse-companies/:path*',
    // Protect all candidate routes
    '/candidate/:path*',
    // Protect all employer routes
    '/employer/:path*',
    // Auth routes
    '/login',
    '/signup',
  ],
};
