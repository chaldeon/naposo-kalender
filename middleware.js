import { NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/statistik');

  if (isProtectedRoute) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const payload = await verifyAdminToken(token);

    if (!payload) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/statistik/:path*'],
};
