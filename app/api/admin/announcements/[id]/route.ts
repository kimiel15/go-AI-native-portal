import { NextRequest, NextResponse } from 'next/server';
import { updateAnnouncement, deleteAnnouncement } from '@/lib/data';

// PATCH /api/admin/announcements/[id] — update (e.g. toggle active, edit fields)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await updateAnnouncement(id, body);
  return NextResponse.json(updated);
}

// DELETE /api/admin/announcements/[id] — remove
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteAnnouncement(id);
  return NextResponse.json({ ok: true });
}
