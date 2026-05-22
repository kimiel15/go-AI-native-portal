import { NextRequest, NextResponse } from 'next/server';
import { updateTeam, deleteTeam, getTeams } from '@/lib/data';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { teamName, department, members } = body;

    if (!teamName || !department || !members || members.length === 0) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Check for duplicate name (excluding this team)
    const teams = await getTeams();
    const duplicate = teams.find(
      t => t.teamName.toLowerCase() === teamName.toLowerCase() && t.id !== id
    );
    if (duplicate) {
      return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
    }

    await updateTeam(id, { teamName, department, members });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTeam(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
