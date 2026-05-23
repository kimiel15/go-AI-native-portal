import { NextRequest, NextResponse } from 'next/server';
import { getJudgeSession } from '@/lib/judge-auth';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

// GET /api/judge/scores?submissionId=x — fetch all scores for a submission
export async function GET(req: NextRequest) {
  const judgeId = await getJudgeSession();
  if (!judgeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const submissionId = req.nextUrl.searchParams.get('submissionId');
  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

  // Return only this judge's score
  const score = await prisma.judgeScore.findUnique({
    where: { submissionId_judgeId: { submissionId, judgeId } },
  });
  return NextResponse.json(score ?? null);
}

// POST /api/judge/scores — save or update a score
export async function POST(req: NextRequest) {
  const judgeId = await getJudgeSession();
  if (!judgeId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { submissionId, businessValue, solutionEffectiveness, productionEvidence, problemClarity, aiIntegration, notes } = body;

  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

  // Weights: BV 30%, SE 20%, PE 20%, PC 15%, AI 15%
  // Each criterion scored 0–100; weighted total → percentage out of 100
  const totalScore =
    (businessValue         * 0.30) +
    (solutionEffectiveness * 0.20) +
    (productionEvidence    * 0.20) +
    (problemClarity        * 0.15) +
    (aiIntegration         * 0.15);

  const data = {
    submissionId,
    judgeId,
    businessValue,
    solutionEffectiveness,
    productionEvidence,
    problemClarity,
    aiIntegration,
    totalScore: Math.round(totalScore * 10) / 10,
    notes: notes ?? null,
    scoredAt: new Date().toISOString(),
  };

  await prisma.judgeScore.upsert({
    where:  { submissionId_judgeId: { submissionId, judgeId } },
    update: data,
    create: { id: randomUUID(), ...data },
  });

  return NextResponse.json({ ok: true, totalScore: data.totalScore });
}
