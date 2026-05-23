import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByEmail } from '@/lib/data';
import prisma from '@/lib/prisma';

// GET /api/participants?email=x  — single participant lookup (assessment auto-fill)
// GET /api/participants?squad=x  — all participants in a squad (member autocomplete)
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const squad = req.nextUrl.searchParams.get('squad');

  if (squad) {
    const rows = await prisma.participant.findMany({
      where: { teamName: { equals: squad, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
      select: { name: true, email: true, siebelId: true },
    });
    return NextResponse.json(rows);
  }

  if (!email) return NextResponse.json(null);
  const p = await getParticipantByEmail(email);
  return NextResponse.json(p ?? null);
}
