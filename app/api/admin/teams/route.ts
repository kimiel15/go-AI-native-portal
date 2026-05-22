import { NextRequest, NextResponse } from 'next/server';
import { getTeams, saveTeam } from '@/lib/data';
import { Team } from '@/types';
import { randomUUID } from 'crypto';

export async function GET() {
  return NextResponse.json(await getTeams());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, department, members } = body;

    if (!teamName || !department || !members || members.length === 0) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const teams = await getTeams();
    const duplicate = teams.find(t => t.teamName.toLowerCase() === teamName.toLowerCase());
    if (duplicate) {
      return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
    }

    const team: Team = {
      id: randomUUID(),
      teamName,
      department,
      members,
      registeredAt: new Date().toISOString(),
    };

    await saveTeam(team);
    return NextResponse.json({ success: true, team });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
