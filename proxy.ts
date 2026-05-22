export { auth as proxy } from '@/auth';

export const config = {
  // Protect the three participant-facing pages.
  // Admin uses its own password gate — leave it alone.
  matcher: ['/assessment/:path*', '/register/:path*', '/submit/:path*'],
};
