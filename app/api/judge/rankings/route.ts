import { NextResponse } from 'next/server';
import { getJudgeSession } from '@/lib/judge-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const judgeId = await getJudgeSession();
  if (!judgeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [submissions, scores] = await Promise.all([
    prisma.submission.findMany({
      where: { status: 'submitted' },
      orderBy: { submittedAt: 'asc' },
    }),
    prisma.judgeScore.findMany(),
  ]);

  // Group scores by submission
  const scoresBySubmission: Record<string, typeof scores> = {};
  for (const s of scores) {
    if (!scoresBySubmission[s.submissionId]) scoresBySubmission[s.submissionId] = [];
    scoresBySubmission[s.submissionId].push(s);
  }

  const rankings = submissions.map(sub => {
    const subScores = scoresBySubmission[sub.id] ?? [];
    const judgeCount = subScores.length;

    // Per-criterion averages
    const avg = (key: keyof typeof subScores[0]) =>
      judgeCount === 0
        ? 0
        : Math.round(subScores.reduce((sum, s) => sum + (s[key] as number), 0) / judgeCount);

    const avgTotal =
      judgeCount === 0
        ? 0
        : Math.round(subScores.reduce((sum, s) => sum + s.totalScore, 0) / judgeCount);

    return {
      id: sub.id,
      teamName: sub.teamName,
      gitRepoUrl: sub.gitRepoUrl,
      measuredResults: sub.measuredResults,
      submittedAt: sub.submittedAt,
      judgeCount,
      avgTotal,
      avgBusinessValue:         avg('businessValue'),
      avgSolutionEffectiveness: avg('solutionEffectiveness'),
      avgProductionEvidence:    avg('productionEvidence'),
      avgProblemClarity:        avg('problemClarity'),
      avgAiIntegration:         avg('aiIntegration'),
      scores: subScores.map(s => ({
        judgeId:              s.judgeId,
        totalScore:           s.totalScore,
        businessValue:        s.businessValue,
        solutionEffectiveness: s.solutionEffectiveness,
        productionEvidence:   s.productionEvidence,
        problemClarity:       s.problemClarity,
        aiIntegration:        s.aiIntegration,
        notes:                s.notes,
        scoredAt:             s.scoredAt,
      })),
    };
  });

  // Sort by avgTotal descending, unscored go last
  rankings.sort((a, b) => {
    if (a.judgeCount === 0 && b.judgeCount === 0) return 0;
    if (a.judgeCount === 0) return 1;
    if (b.judgeCount === 0) return -1;
    return b.avgTotal - a.avgTotal;
  });

  return NextResponse.json(rankings);
}
