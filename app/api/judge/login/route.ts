import { NextRequest, NextResponse } from 'next/server';
import { signJudgeToken, JUDGE_COOKIE, JUDGE_TTL } from '@/lib/judge-auth';

export async function POST(req: NextRequest) {
  const { siebelId, password } = await req.json();

  const judgePassword = process.env.JUDGE_PASSWORD;
  if (!judgePassword) return NextResponse.json({ error: 'Judge access is not configured.' }, { status: 503 });

  if (!siebelId?.trim() || password !== judgePassword) {
    return NextResponse.json({ error: 'Invalid Siebel ID or password.' }, { status: 401 });
  }

  const token = await signJudgeToken(siebelId.trim().toLowerCase());
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
