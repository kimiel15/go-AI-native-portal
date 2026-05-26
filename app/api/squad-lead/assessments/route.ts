import { NextRequest, NextResponse } from 'next/server';
import { getTeams, getAssessments } from '@/lib/data';

// GET /api/squad-lead/assessments?teamId=xxx
// Returns all assessments for members of the given hackathon team,
// matched by participant email against the team's members list.
export async function GET(req: NextRequest) {
  try {
    const teamId = req.nextUrl.searchParams.get('teamId');
    if (!teamId) return NextResponse.json([], { status: 400 });

    const [teams, allAssessments] = await Promise.all([getTeams(), getAssessments()]);

    const team = teams.find(t => t.id === teamId);
    if (!team) return NextResponse.json([], { status: 404 });

    // Build a set of member emails (lowercase) for fast lookup
    const memberEmails = new Set(
      team.members.map(m => m.email?.toLowerCase()).filter(Boolean)
    );

    const teamAssessments = allAssessments.filter(
      a => memberEmails.has(a.participantEmail?.toLowerCase())
    );

    return NextResponse.json(teamAssessments);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
