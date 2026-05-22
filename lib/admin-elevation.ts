import { SignJWT, jwtVerify } from 'jose';

export const ELEVATION_COOKIE = 'admin_elevated';
const ELEVATION_TTL_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required for admin elevation');
  return new TextEncoder().encode(secret);
}

export async function signElevation(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ELEVATION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyElevation(
  token: string | undefined,
  expectedEmail: string | undefined,
): Promise<boolean> {
  if (!token || !expectedEmail) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.email === 'string' && payload.email === expectedEmail;
  } catch {
    return false;
  }
}

export const ELEVATION_MAX_AGE = ELEVATION_TTL_SECONDS;
