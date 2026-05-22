import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByEmail } from '@/lib/data';

// GET /api/participants?email=x — single lookup used by the assessment form
// to auto-fill the participant's pre-assigned team after Microsoft sign-in.
// Returns null if not in the roster.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json(null);
  const p = await getParticipantByEmail(email);
  return NextResponse.json(p ?? null);
}
