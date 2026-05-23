import { NextResponse } from 'next/server';
import { getJudgeSession } from '@/lib/judge-auth';
import prisma from '@/lib/prisma';

// GET /api/judge/submissions — all submitted projects + this judge's scores
export async function GET() {
  const judgeId = await getJudgeSession();
  if (!judgeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [submissions, scores] = await Promise.all([
    prisma.submission.findMany({
      where: { status: 'submitted' },
      orderBy: { submittedAt: 'asc' },
    }),
    prisma.judgeScore.findMany({ where: { judgeId } }),
  ]);

  const scoreMap = Object.fromEntries(scores.map(s => [s.submissionId, s]));

  return NextResponse.json(
    submissions.map(s => ({ ...s, myScore: scoreMap[s.id] ?? null }))
  );
}
