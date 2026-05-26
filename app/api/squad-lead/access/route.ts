import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { resolveAccess } from '@/lib/squad-hierarchy';

// GET /api/squad-lead/access
// Returns { role, name, squads } for the logged-in user based on squad-hierarchy.ts
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ role: 'none', name: '', squads: [] });
  }
  const access = resolveAccess(session.user.email);
  return NextResponse.json(access);
}
