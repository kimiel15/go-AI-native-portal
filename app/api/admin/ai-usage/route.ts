import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUsageLastUploadedAt } from '@/lib/data';

// GET /api/admin/ai-usage
// Returns metadata about the current usage snapshot: row count + last upload time.
export async function GET() {
  const [count, lastUploadedAt] = await Promise.all([
    prisma.aIUsage.count(),
    getUsageLastUploadedAt(),
  ]);
  return NextResponse.json({ count, lastUploadedAt });
}

// DELETE /api/admin/ai-usage
// Wipes the entire AI usage snapshot so the admin can re-upload from scratch.
export async function DELETE() {
  try {
    const { count } = await prisma.aIUsage.deleteMany({});
    return NextResponse.json({ success: true, deleted: count });
  } catch (err) {
    console.error('[DELETE ai-usage]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
