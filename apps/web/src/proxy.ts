import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

function hasSession(request: NextRequest) {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.get(name)?.value);
}

async function getSessionRole(request: NextRequest): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const cookieHeader = request.headers.get('cookie') ?? '';
  try {
    const res = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: { role?: string } } | null;
    return data?.user?.role ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const authenticated = hasSession(request);
  const role = await getSessionRole(request);

  // ===== ROOT REDIRECT =====
  if (pathname === '/' && authenticated) {
    if (role === 'candidate') {
      return NextResponse.redirect(
        new URL('/candidate/dashboard', request.url)
      );
    }

    if (role === 'employer') {
      return NextResponse.redirect(new URL('/employer/dashboard', request.url));
    }
  }

  // ===== PROTECT CANDIDATE ROUTES =====
  if (pathname.startsWith('/candidate')) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (role === 'candidate') {
      if (pathname === '/candidate' || pathname === '/candidate/') {
        return NextResponse.redirect(
          new URL('/candidate/dashboard', request.url)
        );
      }
      return NextResponse.next();
    }

    if (role === 'employer') {
      return NextResponse.redirect(new URL('/employer/dashboard', request.url));
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
        return NextResponse.redirect(
          new URL('/employer/dashboard', request.url)
        );
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

  // ===== HANDLE PUBLIC ROUTES FOR LOGGED-IN USERS =====
  if (authenticated) {
    if (role === 'employer') {
      if (
        pathname.startsWith('/find-jobs') ||
        pathname.startsWith('/browse-companies')
      ) {
        return NextResponse.redirect(
          new URL('/employer/dashboard', request.url)
        );
        // hoặc return new NextResponse(null, { status: 404 });
      }
    }
    if (role === 'candidate') {
      if (pathname.startsWith('/find-jobs')) {
        const newPath = pathname.replace('/find-jobs', '/candidate/find-jobs');
        return NextResponse.redirect(new URL(newPath, request.url));
      }
      if (pathname.startsWith('/browse-companies')) {
        const newPath = pathname.replace(
          '/browse-companies',
          '/candidate/browse-companies'
        );
        return NextResponse.redirect(new URL(newPath, request.url));
      }
    }
  }

  // ===== GUEST-ONLY ROUTES =====
  if (authenticated && (pathname === '/login' || pathname === '/signup')) {
    if (role === 'candidate') {
      return NextResponse.redirect(
        new URL('/candidate/dashboard', request.url)
      );
    }

    if (role === 'employer') {
      return NextResponse.redirect(new URL('/employer/dashboard', request.url));
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
    '/find-jobs/:path*',
    '/browse-companies/:path*',
  ],
};
