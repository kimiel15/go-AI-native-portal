import { NextRequest, NextResponse } from 'next/server';
import { getUsageSummaryBySiebelId } from '@/lib/data';

// GET /api/admin/ai-usage/summary/[siebelId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siebelId: string }> }
) {
  const { siebelId } = await params;
  if (!siebelId) return NextResponse.json(null);
  const summary = await getUsageSummaryBySiebelId(siebelId);
  return NextResponse.json(summary);
}
