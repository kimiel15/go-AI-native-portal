import { NextRequest, NextResponse } from 'next/server';
import { getTeams, saveAssessment } from '@/lib/data';
import { scoreEssays } from '@/lib/claude';
import { Assessment, MC_POINTS, SKILL_LEVELS } from '@/types';
import { randomUUID } from 'crypto';

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
    const { teamId, participantName, participantEmail, q1, q2, q3, q5, q4_essay, q6_essay, q7_essay } = body;

    if (!teamId || !participantName || !participantEmail || !q1 || !q2 || !q3 || !q5 || !q4_essay || !q6_essay || !q7_essay) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const teams = await getTeams();
    if (!teams.find(t => t.id === teamId)) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
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
    const { label: preliminaryLevel, category: categoryRecommendation } = mapToLevel(totalPercent);

    const assessment: Assessment = {
      id: randomUUID(),
      teamId,
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
