import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, getParticipantByEmail, saveParticipant } from '@/lib/data';
import { Participant } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/admin/participants — full list
export async function GET() {
  const list = await getParticipants();
  return NextResponse.json(list);
}

// POST /api/admin/participants — create a new participant
export async function POST(req: NextRequest) {
  try {
    const { name, email, teamId, teamName } = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const existing = await getParticipantByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'A participant with that email already exists.' }, { status: 409 });
    }

    const participant: Participant = {
      id:       randomUUID(),
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      teamId:   teamId   || undefined,
      teamName: teamName || undefined,
    };
    await saveParticipant(participant);
    return NextResponse.json({ success: true, participant });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
