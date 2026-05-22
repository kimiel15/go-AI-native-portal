import { NextRequest, NextResponse } from 'next/server';
import { saveParticipant, deleteParticipant, getParticipants } from '@/lib/data';

// PUT /api/admin/participants/[id] — update name / team assignment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { name, email, teamId, teamName } = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    await saveParticipant({
      id,
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      teamId:   teamId   || undefined,
      teamName: teamName || undefined,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE /api/admin/participants/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const all = await getParticipants();
    if (!all.find(p => p.id === id)) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }
    await deleteParticipant(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
