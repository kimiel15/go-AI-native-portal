import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, getAssessments } from '@/lib/data';

// GET /api/squad-lead/assessments?squad=Squad+Kimiel[&leadEmail=kimiel_magpantay@trendmicro.com]
// 1. Finds all participants whose teamName matches the squad name
// 2. Optionally adds the squad lead's email (for manager views that need the lead's own assessment)
// 3. Returns all assessments whose participantEmail matches those emails
export async function GET(req: NextRequest) {
  try {
    const squad = req.nextUrl.searchParams.get('squad');
    if (!squad) return NextResponse.json([], { status: 400 });

    const leadEmail = req.nextUrl.searchParams.get('leadEmail');

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

    // Optionally include the squad lead's email (so manager can see lead's assessment
    // even if the lead is not enrolled as a participant in this squad)
    if (leadEmail) {
      squadEmails.add(leadEmail.toLowerCase());
    }

    const squadAssessments = allAssessments.filter(
      a => squadEmails.has(a.participantEmail?.toLowerCase())
    );

    return NextResponse.json(squadAssessments);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
