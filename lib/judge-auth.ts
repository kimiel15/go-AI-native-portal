import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const JUDGE_COOKIE = 'judge_session';
const TTL = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(s);
}

export async function signJudgeToken(siebelId: string): Promise<string> {
  return new SignJWT({ siebelId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(secret());
}

export async function verifyJudgeToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.siebelId === 'string' ? payload.siebelId : null;
  } catch {
    return null;
  }
}

/** Returns the judge's Siebel ID from the session cookie, or null. */
export async function getJudgeSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(JUDGE_COOKIE)?.value;
  if (!token) return null;
  return verifyJudgeToken(token);
}

export const JUDGE_TTL = TTL;
