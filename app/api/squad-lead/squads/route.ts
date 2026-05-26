import { NextResponse } from 'next/server';
import { getParticipants } from '@/lib/data';

// GET /api/squad-lead/squads
// Returns all unique squad names (teamName) from the participants table,
// sorted alphabetically, with member count.
export async function GET() {
  try {
    const participants = await getParticipants();

    const map = new Map<string, number>();
    for (const p of participants) {
      if (!p.teamName) continue;
      map.set(p.teamName, (map.get(p.teamName) ?? 0) + 1);
    }

    const squads = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(squads);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
