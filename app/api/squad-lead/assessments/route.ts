import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, getAssessments } from '@/lib/data';

// GET /api/squad-lead/assessments?squad=Squad+Kimiel
// 1. Finds all participants whose teamName matches the squad name
// 2. Returns all assessments whose participantEmail matches those participants
export async function GET(req: NextRequest) {
  try {
    const squad = req.nextUrl.searchParams.get('squad');
    if (!squad) return NextResponse.json([], { status: 400 });

    const [participants, allAssessments] = await Promise.all([
      getParticipants(),
      getAssessments(),
    ]);

    // Build a set of emails belonging to this squad
    const squadEmails = new Set(
      participants
        .filter(p => p.teamName === squad)
        .map(p => p.email?.toLowerCase())
        .filter(Boolean)
    );

    const squadAssessments = allAssessments.filter(
      a => squadEmails.has(a.participantEmail?.toLowerCase())
    );

    return NextResponse.json(squadAssessments);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
