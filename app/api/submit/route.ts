import { NextRequest, NextResponse } from 'next/server';
import { getTeams, getSubmissionByTeamId, saveSubmission, getSetting } from '@/lib/data';
import { ProjectSubmission } from '@/types';
import { randomUUID } from 'crypto';

const CLOSED_MSG = 'Submissions are closed. Contact the admin if you believe this is an error.';

// GET /api/submit?teamId=xxx — load existing submission for a team
export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('teamId');
  if (!teamId) return NextResponse.json(null);
  const sub = await getSubmissionByTeamId(teamId);
  return NextResponse.json(sub ?? null);
}

// POST /api/submit — save draft (create or update)
export async function POST(req: NextRequest) {
  try {
    const submissionsOpen = (await getSetting('submissionsOpen', 'true')) === 'true';
    if (!submissionsOpen) return NextResponse.json({ error: CLOSED_MSG }, { status: 403 });

    const body = await req.json();
    const { teamId, gitRepoUrl, measuredResults, businessValue } = body;

    if (!teamId || !gitRepoUrl || !measuredResults) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const teams = await getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    // Block edits if already submitted
    const existing = await getSubmissionByTeamId(teamId);
    if (existing?.status === 'submitted') {
      return NextResponse.json({ error: 'This submission has already been finalised and cannot be edited.' }, { status: 403 });
    }

    const submission: ProjectSubmission = {
      id:                  existing?.id ?? randomUUID(),
      teamId,
      teamName:            team.teamName,
      gitRepoUrl,
      problemStatement:    '',
      solutionDescription: '',
      productionEvidence:  '',
      measuredResults,
      impactMath:          '',
      aiUsage:             '',
      teamContributions:   '',
      businessValue:       businessValue ?? undefined,
      status:              'draft',
      submittedAt:         new Date().toISOString(),
    };

    await saveSubmission(submission);
    return NextResponse.json({ success: true, submissionId: submission.id, status: 'draft' });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/submit — finalise and lock submission for review
export async function PATCH(req: NextRequest) {
  try {
    const submissionsOpen = (await getSetting('submissionsOpen', 'true')) === 'true';
    if (!submissionsOpen) return NextResponse.json({ error: CLOSED_MSG }, { status: 403 });

    const body = await req.json();
    const { teamId, gitRepoUrl, measuredResults, businessValue } = body;

    if (!teamId || !gitRepoUrl || !measuredResults) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const teams = await getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const existing = await getSubmissionByTeamId(teamId);
    if (existing?.status === 'submitted') {
      return NextResponse.json({ error: 'Already submitted.' }, { status: 403 });
    }

    const submission: ProjectSubmission = {
      id:                  existing?.id ?? randomUUID(),
      teamId,
      teamName:            team.teamName,
      gitRepoUrl,
      problemStatement:    '',
      solutionDescription: '',
      productionEvidence:  '',
      measuredResults,
      impactMath:          '',
      aiUsage:             '',
      teamContributions:   '',
      businessValue:       businessValue ?? undefined,
      status:              'submitted',
      submittedAt:         new Date().toISOString(),
    };

    await saveSubmission(submission);
    return NextResponse.json({ success: true, submissionId: submission.id, status: 'submitted' });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
