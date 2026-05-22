import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTeams } from '@/lib/data';

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json(null);

  const teams = await getTeams();
  const team = teams.find(t => t.members.some(m => m.email?.toLowerCase() === email));
  if (!team) return NextResponse.json(null);

  return NextResponse.json({
    id: team.id,
    teamName: team.teamName,
    department: team.department,
    members: team.members,
    registeredAt: team.registeredAt,
  });
}
