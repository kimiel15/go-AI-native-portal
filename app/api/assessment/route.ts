import { NextRequest, NextResponse } from 'next/server';
import { saveAssessment } from '@/lib/data';
import { scoreEssays } from '@/lib/claude';
import { Assessment, MC_POINTS, SKILL_LEVELS } from '@/types';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';

// GET /api/assessment?email=x — check if participant already submitted
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ submitted: false });
  const existing = await prisma.assessment.findUnique({ where: { participantEmail: email.toLowerCase() } });
  return NextResponse.json({ submitted: !!existing });
}

function calcMcScore(q1: string, q2: string, q3: string, q5: string): number {
  return (MC_POINTS.q1[q1] ?? 0) + (MC_POINTS.q2[q2] ?? 0)
       + (MC_POINTS.q3[q3] ?? 0) + (MC_POINTS.q5[q5] ?? 0);
}

function mapToLevel(percent: number): { label: string; category: string } {
  return SKILL_LEVELS.find(l => percent >= l.min && percent <= l.max)
    ?? SKILL_LEVELS[SKILL_LEVELS.length - 1];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantName, participantEmail, q1, q2, q3, q5, q4_essay, q6_essay, q7_essay } = body;

    if (!participantName || !participantEmail || !q1 || !q2 || !q3 || !q5 || !q4_essay || !q6_essay || !q7_essay) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // One attempt per participant — admin must reset to allow a retake
    const existing = await prisma.assessment.findUnique({ where: { participantEmail: participantEmail.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'You have already submitted an assessment. Contact your admin to reset it.' }, { status: 409 });
    }

    const mcScore = calcMcScore(q1, q2, q3, q5);
    const MC_MAX = 17;
    const ESSAY_MAX = 24;
    const TOTAL_MAX = 41;

    // Score essays via Claude
    let essayScores;
    let essayTotal = 0;
    try {
      essayScores = await scoreEssays(q4_essay, q6_essay, q7_essay);
      essayTotal = essayScores.section2_essay.score
                + essayScores.section3_essay.score
                + essayScores.section4_essay.score;
    } catch (err) {
      console.error('Claude scoring failed:', err);
      // Graceful fallback: essays unscored, mark for manual review
    }

    const totalScore = mcScore + essayTotal;
    const totalPercent = Math.round((totalScore / TOTAL_MAX) * 100);

    // Use Claude's holistic level judgment when essays are scored —
    // it reads the actual content and is more accurate than a raw %.
    // Fall back to numeric thresholds only when essay scoring failed.
    let preliminaryLevel: string;
    let categoryRecommendation: string;
    if (essayScores?.overall_level) {
      // "Level 1" / "Level 2" / "Level 3" → 0-based index into SKILL_LEVELS
      const idx = Math.max(0, Math.min(2, parseInt(essayScores.overall_level.replace(/\D/g, ''), 10) - 1));
      preliminaryLevel = SKILL_LEVELS[idx].label;
      categoryRecommendation = SKILL_LEVELS[idx].category;
    } else {
      const mapped = mapToLevel(totalPercent);
      preliminaryLevel = mapped.label;
      categoryRecommendation = mapped.category;
    }

    const assessment: Assessment = {
      id: randomUUID(),
      participantName,
      participantEmail,
      q1, q2, q3, q5,
      q4_essay, q6_essay, q7_essay,
      mcScore,
      mcMax: MC_MAX,
      essayScores,
      essayTotal,
      essayMax: ESSAY_MAX,
      totalScore,
      totalMax: TOTAL_MAX,
      totalPercent,
      preliminaryLevel,
      categoryRecommendation,
      submittedAt: new Date().toISOString(),
    };

    await saveAssessment(assessment);

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      mcScore,
      essayTotal: essayTotal || null,
      totalScore,
      totalPercent,
      preliminaryLevel,
      categoryRecommendation,
      overallExplanation: essayScores?.overall_explanation ?? null,
      squadLeadNote: essayScores?.squad_lead_note ?? null,
      essayScoringFailed: !essayScores,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
