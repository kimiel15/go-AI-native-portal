import prisma from '@/lib/prisma';
import { Team, ProjectSubmission, Assessment } from '@/types';

// ── Teams ────────────────────────────────────────────────────────────────────

export async function getTeams(): Promise<Team[]> {
  const rows = await prisma.team.findMany({ orderBy: { registeredAt: 'asc' } });
  return rows.map(r => ({
    ...r,
    members:      r.members      as unknown as Team['members'],
    submissionId: r.submissionId ?? undefined,   // Prisma returns null; TS type expects undefined
  }));
}

export async function saveTeam(team: Team): Promise<void> {
  await prisma.team.create({ data: { ...team, members: team.members as object[] } });
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<void> {
  const data: Record<string, unknown> = { ...updates };
  if (updates.members) data.members = updates.members as object[];
  await prisma.team.update({ where: { id }, data });
}

export async function deleteTeam(id: string): Promise<void> {
  await prisma.team.delete({ where: { id } });
}

// ── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<ProjectSubmission[]> {
  const rows = await prisma.submission.findMany({ orderBy: { submittedAt: 'desc' } });
  return rows as unknown as ProjectSubmission[];
}

export async function getSubmissionByTeamId(teamId: string): Promise<ProjectSubmission | null> {
  const row = await prisma.submission.findUnique({ where: { teamId } });
  return row as unknown as ProjectSubmission | null;
}

export async function saveSubmission(sub: ProjectSubmission): Promise<void> {
  await prisma.submission.upsert({
    where: { teamId: sub.teamId },
    update: {
      gitRepoUrl:      sub.gitRepoUrl,
      measuredResults: sub.measuredResults,
      status:          sub.status,
      submittedAt:     sub.submittedAt,
    },
    create: {
      id:              sub.id,
      teamId:          sub.teamId,
      teamName:        sub.teamName,
      gitRepoUrl:      sub.gitRepoUrl,
      measuredResults: sub.measuredResults,
      status:          sub.status,
      submittedAt:     sub.submittedAt,
    },
  });
}

// ── Assessments ──────────────────────────────────────────────────────────────

export async function getAssessments(): Promise<Assessment[]> {
  const rows = await prisma.assessment.findMany({ orderBy: { submittedAt: 'desc' } });
  return rows.map(r => ({
    ...r,
    // Prisma nullable (null) → TypeScript optional (undefined)
    essayScores:            r.essayScores            as unknown as Assessment['essayScores'] ?? undefined,
    validation:             r.validation             as unknown as Assessment['validation']  ?? undefined,
    essayTotal:             r.essayTotal             ?? undefined,
    totalScore:             r.totalScore             ?? undefined,
    totalPercent:           r.totalPercent           ?? undefined,
    preliminaryLevel:       r.preliminaryLevel       ?? undefined,
    categoryRecommendation: r.categoryRecommendation ?? undefined,
  }));
}

export async function saveAssessment(assessment: Assessment): Promise<void> {
  const data = {
    ...assessment,
    essayScores: assessment.essayScores ? (assessment.essayScores as object) : undefined,
    validation:  assessment.validation  ? (assessment.validation  as object) : undefined,
  };
  await prisma.assessment.upsert({
    where:  { participantEmail: assessment.participantEmail },
    update: data,
    create: data,
  });
}

export async function updateAssessment(id: string, updates: Partial<Assessment>): Promise<void> {
  const data: Record<string, unknown> = { ...updates };
  if (updates.essayScores) data.essayScores = updates.essayScores as object;
  if (updates.validation)  data.validation  = updates.validation  as object;
  await prisma.assessment.update({ where: { id }, data });
}
