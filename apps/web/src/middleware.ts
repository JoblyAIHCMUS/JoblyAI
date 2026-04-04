import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect all /employer/* routes
  if (request.nextUrl.pathname.startsWith('/employer')) {
    // Check for authentication cookie/session
    const sessionCookie = request.cookies.get('better-auth.session_token');
    const authCookie = request.cookies.get(
      '__Secure-better-auth.session_token'
    );

    // If no session found, redirect to login
    if (!sessionCookie && !authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/employer', '/employer/:path*'],
};
