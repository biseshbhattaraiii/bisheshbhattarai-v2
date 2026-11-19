import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Gate for everything behind the password.
 *
 * Pages redirect to the login screen; API routes get a 401 so the editor
 * can react without following a redirect it can't render.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isSessionRoute = pathname === '/api/admin/session';
  if (isLoginPage || isSessionRoute) {
    return NextResponse.next();
  }

  const authorised = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  if (authorised) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Not signed in.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/ai/:path*'],
};
