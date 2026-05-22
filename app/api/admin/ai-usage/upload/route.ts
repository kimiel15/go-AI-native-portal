import { NextRequest, NextResponse } from 'next/server';
import { replaceAIUsage } from '@/lib/data';
import { AIUsageRow } from '@/types';
import { randomUUID } from 'crypto';

interface IncomingRow { siebelId?: string; month?: string; amountUsd?: number | string; }

// POST /api/admin/ai-usage/upload
// Body: { rows: [{ siebelId, month: "YYYY-MM", amountUsd }, ...] }
// Wipes existing usage data and replaces with the uploaded snapshot.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incoming: IncomingRow[] = Array.isArray(body?.rows) ? body.rows : [];

    if (incoming.length === 0) {
      return NextResponse.json({ error: 'No rows provided.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const errors: { row: number; siebelId: string; reason: string }[] = [];
    const cleaned: AIUsageRow[] = [];

    for (let i = 0; i < incoming.length; i++) {
      const r = incoming[i];
      const siebelId = (r.siebelId ?? '').toString().trim().toLowerCase();
      const month    = (r.month    ?? '').toString().trim();
      const amount   = typeof r.amountUsd === 'number' ? r.amountUsd : Number(r.amountUsd);

      if (!siebelId) {
        errors.push({ row: i + 1, siebelId: '(empty)', reason: 'Missing siebelId' });
        continue;
      }
      if (!/^\d{4}-\d{2}$/.test(month)) {
        errors.push({ row: i + 1, siebelId, reason: `Invalid month "${month}" (expected YYYY-MM)` });
        continue;
      }
      if (!Number.isFinite(amount) || amount < 0) {
        errors.push({ row: i + 1, siebelId, reason: `Invalid amount "${r.amountUsd}"` });
        continue;
      }

      cleaned.push({
        id:         randomUUID(),
        siebelId,
        month,
        amountUsd:  amount,
        uploadedAt: now,
      });
    }

    const { inserted } = await replaceAIUsage(cleaned);
    const distinctUsers = new Set(cleaned.map(r => r.siebelId)).size;

    return NextResponse.json({
      inserted,
      distinctUsers,
      errors,
      uploadedAt: now,
    });
  } catch (err) {
    console.error('[ai-usage upload]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
