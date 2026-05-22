import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Explicit proxy function — compatible with Next.js 16 proxy convention
// and next-auth v5 beta. auth() wraps the handler and injects req.auth.
export const proxy = auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  // Authenticated — allow through
});

export const config = {
  // Protect the three participant-facing pages.
  // Admin uses its own password gate — leave it alone.
  matcher: ['/assessment/:path*', '/register/:path*', '/submit/:path*', '/submissions/:path*', '/submissions'],
};
