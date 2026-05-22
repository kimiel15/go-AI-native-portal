import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { ELEVATION_COOKIE, verifyElevation } from '@/lib/admin-elevation';

// Dev-only escape hatch for local UI iteration when Microsoft SSO cannot
// be tested locally (e.g., Entra app registration lacks a localhost redirect URI).
// Requires BOTH conditions — Azure runs with NODE_ENV=production, so the bypass
// is inert in deployed environments.
const DEV_BYPASS =
  process.env.NODE_ENV === 'development' &&
  process.env.DEV_BYPASS_ADMIN_AUTH === 'true';

// Next.js 16 proxy convention (replaces middleware.ts).
// auth() wraps the handler and injects req.auth.
export const proxy = auth(async (req) => {
  const path = req.nextUrl.pathname;
  const isAdminArea =
    path.startsWith('/admin/dashboard') ||
    (path.startsWith('/api/admin') && !path.startsWith('/api/admin/elevate'));
  const email = req.auth?.user?.email ?? undefined;

  if (isAdminArea) {
    if (DEV_BYPASS) {
      console.warn(`⚠️  ADMIN AUTH BYPASS ACTIVE — ${req.method} ${path}`);
      return;
    }
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
