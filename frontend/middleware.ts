import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('careeratlas_session')?.value;
  const { pathname } = request.nextUrl;

  // Define public vs protected path patterns
  const isLoginPage = pathname === '/login';
  const isProtectedPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/resumes' || pathname.startsWith('/resumes/') || pathname === '/tracker' || pathname.startsWith('/tracker/');

  // If user is accessing login page with an active session cookie, redirect to dashboard
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is accessing protected routes without a session cookie, redirect to login page
  if (isProtectedPage && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/resumes/:path*', '/tracker/:path*', '/login'],
};
