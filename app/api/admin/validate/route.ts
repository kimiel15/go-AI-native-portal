import { NextRequest, NextResponse } from 'next/server';
import { updateAssessment, getAssessments } from '@/lib/data';
import { SquadLeadValidation } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, action, finalLevel, reason, validatedBy } = await req.json();

    if (!assessmentId || !action || !finalLevel || !reason || !validatedBy) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!['confirm', 'upgrade', 'downgrade'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const assessments = getAssessments();
    if (!assessments.find(a => a.id === assessmentId)) {
      return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    const validation: SquadLeadValidation = {
      action,
      finalLevel,
      reason,
      validatedBy,
      validatedAt: new Date().toISOString(),
    };

    updateAssessment(assessmentId, { validation });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
