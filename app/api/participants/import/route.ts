import { NextRequest, NextResponse } from 'next/server';
import { getTeams, getParticipantByEmail, saveParticipant } from '@/lib/data';
import { Participant } from '@/types';
import { randomUUID } from 'crypto';

export interface ImportRow {
  name: string;
  email: string;
  teamName?: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; email: string; reason: string }[];
}

// POST /api/participants/import
// Body: { rows: ImportRow[] }
export async function POST(req: NextRequest) {
  try {
    const { rows }: { rows: ImportRow[] } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided.' }, { status: 400 });
    }

    const teams = await getTeams();
    const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name  = row.name?.toString().trim();
      const email = row.email?.toString().trim().toLowerCase();

      if (!name || !email) {
        result.errors.push({ row: i + 2, email: email || '(empty)', reason: 'Missing name or email' });
        result.skipped++;
        continue;
      }
      if (!email.includes('@')) {
        result.errors.push({ row: i + 2, email, reason: 'Invalid email address' });
        result.skipped++;
        continue;
      }

      // Match team by name (case-insensitive)
      const teamName = row.teamName?.toString().trim();
      const matchedTeam = teamName
        ? teams.find(t => t.teamName.toLowerCase() === teamName.toLowerCase())
        : undefined;

      const existing = await getParticipantByEmail(email);
      const participant: Participant = {
        id:       existing?.id ?? randomUUID(),
        name,
        email,
        teamId:   matchedTeam?.id   ?? existing?.teamId,
        teamName: matchedTeam?.teamName ?? (teamName && !matchedTeam ? teamName : existing?.teamName),
      };

      await saveParticipant(participant);
      if (existing) result.updated++; else result.created++;
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
