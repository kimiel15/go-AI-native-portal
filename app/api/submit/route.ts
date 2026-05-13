import { NextRequest, NextResponse } from 'next/server';
import { getTeams, saveSubmission } from '@/lib/data';
import { ProjectSubmission } from '@/types';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamId,
      gitRepoUrl,
      problemStatement,
      solutionDescription,
      productionEvidence,
      measuredResults,
      impactMath,
      aiUsage,
      teamContributions,
    } = body;

    if (!teamId || !gitRepoUrl || !problemStatement || !solutionDescription || !measuredResults || !impactMath || !aiUsage) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const teams = getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const submission: ProjectSubmission = {
      id: randomUUID(),
      teamId,
      teamName: team.teamName,
      gitRepoUrl,
      problemStatement,
      solutionDescription,
      productionEvidence: productionEvidence || '',
      measuredResults,
      impactMath,
      aiUsage,
      teamContributions: teamContributions || '',
      submittedAt: new Date().toISOString(),
    };

    saveSubmission(submission);
    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
