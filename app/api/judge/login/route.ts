import { NextRequest, NextResponse } from 'next/server';
import { signJudgeToken, JUDGE_COOKIE, JUDGE_TTL } from '@/lib/judge-auth';

const ALLOWED_JUDGES = ['ribenitor', 'karens', 'jezriela', 'michaell'];

export async function POST(req: NextRequest) {
  const { siebelId, password } = await req.json();

  const judgePassword = process.env.JUDGE_PASSWORD;
  if (!judgePassword) return NextResponse.json({ error: 'Judge access is not configured.' }, { status: 503 });

  const id = siebelId?.trim().toLowerCase();

  if (!id || !ALLOWED_JUDGES.includes(id) || password !== judgePassword) {
    return NextResponse.json({ error: 'Invalid Siebel ID or password.' }, { status: 401 });
  }

  const token = await signJudgeToken(id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(JUDGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JUDGE_TTL,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(JUDGE_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
