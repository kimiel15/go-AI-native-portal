import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/squad-lead/summary?squads=Squad+Zean,Squad+Keren,...
// Returns { squadName, totalParticipants, assessedCount }[] for each squad
export async function GET(req: NextRequest) {
  try {
    const squadsParam = req.nextUrl.searchParams.get('squads');
    if (!squadsParam) return NextResponse.json([]);

    const squadNames = squadsParam.split(',').map(s => s.trim()).filter(Boolean);

    const results = await Promise.all(
      squadNames.map(async (squadName) => {
        const [totalParticipants, assessedCount] = await Promise.all([
          prisma.participant.count({
            where: { teamName: { equals: squadName, mode: 'insensitive' } },
          }),
          prisma.assessment.count({
            where: {
              participantEmail: {
                in: await prisma.participant
                  .findMany({
                    where: { teamName: { equals: squadName, mode: 'insensitive' } },
                    select: { email: true },
                  })
                  .then(rows => rows.map(r => r.email).filter(Boolean) as string[]),
              },
            },
          }),
        ]);
        return { squadName, totalParticipants, assessedCount };
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
