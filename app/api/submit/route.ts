import { NextRequest, NextResponse } from 'next/server';
import { getTeams, saveSubmission } from '@/lib/data';
import { ProjectSubmission } from '@/types';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, gitRepoUrl, measuredResults } = body;

    if (!teamId || !gitRepoUrl || !measuredResults) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const teams = await getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const submission: ProjectSubmission = {
      id: randomUUID(),
      teamId,
      teamName: team.teamName,
      gitRepoUrl,
      // Legacy fields not collected by the simplified form — left empty.
      // Full details live in the README.md linked via gitRepoUrl.
      problemStatement: '',
      solutionDescription: '',
      productionEvidence: '',
      measuredResults,
      impactMath: '',
      aiUsage: '',
      teamContributions: '',
      submittedAt: new Date().toISOString(),
    };

    await saveSubmission(submission);
    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
