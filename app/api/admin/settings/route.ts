import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/data';

// GET /api/admin/settings — returns current portal flags
export async function GET() {
  const submissionsOpen = (await getSetting('submissionsOpen', 'true')) === 'true';
  return NextResponse.json({ submissionsOpen });
}

// PUT /api/admin/settings — update a flag
export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (typeof body.submissionsOpen === 'boolean') {
    await setSetting('submissionsOpen', body.submissionsOpen ? 'true' : 'false');
  }
  const submissionsOpen = (await getSetting('submissionsOpen', 'true')) === 'true';
  return NextResponse.json({ submissionsOpen });
}
