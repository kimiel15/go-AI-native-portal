import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/data';

// GET /api/admin/settings — returns current portal flags
export async function GET() {
  const [submissionsOpen, assessmentOpen, judgingCriteriaVisible] = await Promise.all([
    getSetting('submissionsOpen', 'true'),
    getSetting('assessmentOpen', 'false'),
    getSetting('judgingCriteriaVisible', 'true'),
  ]);
  return NextResponse.json({
    submissionsOpen:        submissionsOpen        === 'true',
    assessmentOpen:         assessmentOpen         === 'true',
    judgingCriteriaVisible: judgingCriteriaVisible === 'true',
  });
}

// PUT /api/admin/settings — update a flag
export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (typeof body.submissionsOpen === 'boolean') {
    await setSetting('submissionsOpen', body.submissionsOpen ? 'true' : 'false');
  }
  if (typeof body.assessmentOpen === 'boolean') {
    await setSetting('assessmentOpen', body.assessmentOpen ? 'true' : 'false');
  }
  if (typeof body.judgingCriteriaVisible === 'boolean') {
    await setSetting('judgingCriteriaVisible', body.judgingCriteriaVisible ? 'true' : 'false');
  }
  const [submissionsOpen, assessmentOpen, judgingCriteriaVisible] = await Promise.all([
    getSetting('submissionsOpen', 'true'),
    getSetting('assessmentOpen', 'false'),
    getSetting('judgingCriteriaVisible', 'true'),
  ]);
  return NextResponse.json({
    submissionsOpen:        submissionsOpen        === 'true',
    assessmentOpen:         assessmentOpen         === 'true',
    judgingCriteriaVisible: judgingCriteriaVisible === 'true',
  });
}
