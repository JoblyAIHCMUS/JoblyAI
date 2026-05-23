import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

function hasSession(request: NextRequest) {
  return SESSION_COOKIE_NAMES.some(
    (name) => request.cookies.get(name)?.value
  );
}

function getRole(request: NextRequest) {
  return request.cookies.get('user-role')?.value ?? null;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const authenticated = hasSession(request);
  const role = getRole(request);

  // ===== ROOT REDIRECT =====
  if (pathname === '/' && authenticated) {
    if (role === 'candidate') {
      return NextResponse.redirect(
        new URL('/candidate/dashboard', request.url)
      );
    }

    if (role === 'employer') {
      return NextResponse.redirect(
        new URL('/employer/dashboard', request.url)
      );
    }
  }

  // ===== PROTECT CANDIDATE ROUTES =====
  if (pathname.startsWith('/candidate')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (role === 'candidate') {
      if (pathname === '/candidate' || pathname === '/candidate/') {
        return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (role === 'employer') {
      return NextResponse.redirect(
        new URL('/employer/dashboard', request.url)
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  // ===== PROTECT EMPLOYER ROUTES =====
  if (pathname.startsWith('/employer')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (role === 'employer') {
      if (pathname === '/employer' || pathname === '/employer/') {
        return NextResponse.redirect(new URL('/employer/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (role === 'candidate') {
      return NextResponse.redirect(
        new URL('/candidate/dashboard', request.url)
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  // ===== GUEST-ONLY ROUTES =====
  if (authenticated && (pathname === '/login' || pathname === '/signup')) {
    if (role === 'candidate') {
      return NextResponse.redirect(
        new URL('/candidate/dashboard', request.url)
      );
    }

    if (role === 'employer') {
      return NextResponse.redirect(
        new URL('/employer/dashboard', request.url)
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/candidate/:path*',
    '/employer/:path*',
  ],
};
