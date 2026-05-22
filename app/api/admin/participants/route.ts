import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, getParticipantByEmail, saveParticipant } from '@/lib/data';
import { Participant } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/admin/participants — full list
export async function GET() {
  try {
    const list = await getParticipants();
    return NextResponse.json(list);
  } catch (err) {
    console.error('[GET participants]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
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
  } catch (err) {
    console.error('[POST participants]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
