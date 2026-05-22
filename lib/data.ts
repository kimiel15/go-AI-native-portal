import prisma from '@/lib/prisma';
import { Team, ProjectSubmission, Assessment, Participant, AIUsageRow, AIUsageSummary, USAGE_THRESHOLDS } from '@/types';

// ── Participants ─────────────────────────────────────────────────────────────

export async function getParticipants(): Promise<Participant[]> {
  const rows = await prisma.participant.findMany({ orderBy: { name: 'asc' } });
  return rows.map(r => ({
    ...r,
    siebelId: r.siebelId ?? undefined,
    teamId:   r.teamId   ?? undefined,
    teamName: r.teamName ?? undefined,
  }));
}

export async function getParticipantByEmail(email: string): Promise<Participant | null> {
  const row = await prisma.participant.findUnique({ where: { email: email.toLowerCase() } });
  if (!row) return null;
  return {
    ...row,
    siebelId: row.siebelId ?? undefined,
    teamId:   row.teamId   ?? undefined,
    teamName: row.teamName ?? undefined,
  };
}

export async function saveParticipant(p: Participant): Promise<void> {
  const data = {
    name:     p.name,
    siebelId: p.siebelId ?? null,
    teamId:   p.teamId ?? null,
    teamName: p.teamName ?? null,
  };
  await prisma.participant.upsert({
    where:  { email: p.email.toLowerCase() },
    update: data,
    create: { id: p.id, email: p.email.toLowerCase(), ...data },
  });
}

export async function deleteParticipant(id: string): Promise<void> {
  await prisma.participant.delete({ where: { id } });
}

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
  // Cascade manually — schema has no FKs. Free the participants and remove
  // any submission so the team can re-register and resubmit cleanly.
  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { teamId: id } }),
    prisma.participant.updateMany({
      where: { teamId: id },
      data:  { teamId: null, teamName: null },
    }),
    prisma.team.delete({ where: { id } }),
  ]);
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

export async function deleteSubmission(id: string): Promise<void> {
  await prisma.submission.delete({ where: { id } });
}

export async function deleteSubmissionByTeamId(teamId: string): Promise<void> {
  await prisma.submission.deleteMany({ where: { teamId } });
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
    teamId:                 r.teamId                 ?? undefined,
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

export async function deleteAssessment(id: string): Promise<void> {
  await prisma.assessment.delete({ where: { id } });
}

export async function updateAssessment(id: string, updates: Partial<Assessment>): Promise<void> {
  const data: Record<string, unknown> = { ...updates };
  if (updates.essayScores) data.essayScores = updates.essayScores as object;
  if (updates.validation)  data.validation  = updates.validation  as object;
  await prisma.assessment.update({ where: { id }, data });
}

// ── AI Usage Verification ───────────────────────────────────────────────────

export async function replaceAIUsage(rows: AIUsageRow[]): Promise<{ inserted: number }> {
  if (rows.length === 0) return { inserted: 0 };
  // A fresh upload represents the latest snapshot — wipe and replace.
  await prisma.$transaction([
    prisma.aIUsage.deleteMany({}),
    prisma.aIUsage.createMany({
      data: rows.map(r => ({
        id:         r.id,
        siebelId:   r.siebelId.toLowerCase(),
        month:      r.month,
        amountUsd:  r.amountUsd,
        uploadedAt: r.uploadedAt,
      })),
    }),
  ]);
  return { inserted: rows.length };
}

export async function getUsageSummaryBySiebelId(siebelId: string): Promise<AIUsageSummary | null> {
  const id = siebelId.toLowerCase();
  const rows = await prisma.aIUsage.findMany({
    where:   { siebelId: id },
    orderBy: { month: 'asc' },
  });
  if (rows.length === 0) return null;

  const monthly = rows.map(r => ({ month: r.month, amount: r.amountUsd }));
  const total   = monthly.reduce((s, m) => s + m.amount, 0);
  const tier: AIUsageSummary['tier'] =
    total >= USAGE_THRESHOLDS.power  ? 'power'  :
    total >= USAGE_THRESHOLDS.active ? 'active' : 'none';

  return {
    siebelId:    id,
    total,
    monthly,
    tier,
    lastUpdated: rows[0]?.uploadedAt ?? null,
  };
}

export async function getUsageLastUploadedAt(): Promise<string | null> {
  const row = await prisma.aIUsage.findFirst({ orderBy: { uploadedAt: 'desc' } });
  return row?.uploadedAt ?? null;
}
