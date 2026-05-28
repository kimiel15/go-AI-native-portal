import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncements, saveAnnouncement } from '@/lib/data';
import { randomUUID } from 'crypto';

// GET /api/admin/announcements — list all (active + inactive)
export async function GET() {
  const rows = await getAnnouncements();
  return NextResponse.json(rows);
}

// POST /api/admin/announcements — create new announcement
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, tag, title, body: text, date, link, linkLabel, external, active, order } = body;

  if (!type || !tag || !title || !text) {
    return NextResponse.json({ error: 'type, tag, title, and body are required.' }, { status: 400 });
  }

  const row = await saveAnnouncement({
    id:        randomUUID(),
    type:      type      ?? 'tip',
    tag:       tag       ?? 'Note',
    title:     title     ?? '',
    body:      text      ?? '',
    date:      date      ?? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    link:      link      ?? null,
    linkLabel: linkLabel ?? null,
    external:  external  ?? false,
    active:    active    ?? true,
    order:     order     ?? 0,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(row, { status: 201 });
}
