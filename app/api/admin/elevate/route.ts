import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { ELEVATION_COOKIE, ELEVATION_MAX_AGE, signElevation } from '@/lib/admin-elevation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: Request) {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });
  }

  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'Sign in with Microsoft first.' }, { status: 401 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const token = await signElevation(email);
  (await cookies()).set(ELEVATION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ELEVATION_MAX_AGE,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  (await cookies()).delete(ELEVATION_COOKIE);
  return NextResponse.json({ success: true });
}
