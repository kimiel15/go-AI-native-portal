import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { ELEVATION_COOKIE, verifyElevation } from '@/lib/admin-elevation';

// Next.js 16 proxy convention (replaces middleware.ts).
// auth() wraps the handler and injects req.auth.
export const proxy = auth(async (req) => {
  const path = req.nextUrl.pathname;
  const isAdminArea =
    path.startsWith('/admin/dashboard') ||
    (path.startsWith('/api/admin') && !path.startsWith('/api/admin/elevate'));
  const email = req.auth?.user?.email ?? undefined;

  if (isAdminArea) {
    if (!email) {
      // Not signed in at all → send to SSO, come back to /admin to finish elevation.
      const signInUrl = new URL('/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', '/admin');
      return NextResponse.redirect(signInUrl);
    }
    const elevated = await verifyElevation(req.cookies.get(ELEVATION_COOKIE)?.value, email);
    if (!elevated) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Admin password required.' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return;
  }

  if (!req.auth) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/api/admin/:path*',
    '/assessment/:path*',
    '/register/:path*',
    '/submit/:path*',
    '/submissions/:path*',
    '/submissions',
  ],
};
