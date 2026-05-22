import { NextResponse } from 'next/server';
import { scoreEssays } from '@/lib/claude';

// GET /api/admin/test-ai — runs the full scoreEssays() call with dummy answers
// so we can see exactly what succeeds or fails without a full assessment retake.
export async function GET() {
  try {
    const result = await scoreEssays(
      'I write detailed prompts with role, context, constraints and output format. For example, when generating incident summaries I specify: role=support engineer, tone=concise, output=bullet points with severity tag. This reduces back-and-forth and gives consistent results the whole squad can use.',
      'I built a Claude-powered triage bot integrated into our ticketing system. It reads incoming tickets, classifies severity, suggests KB articles, and drafts a first-response email. It is deployed in production and handles about 200 tickets per day across the org, reducing mean time to first response by 40%.',
      'AI is fundamentally changing how support engineering works — from reactive ticket handling to proactive, AI-augmented resolution. I have already shared my prompt templates with the squad, run two internal workshops on prompt engineering, and am building a shared prompt library on Confluence. In 1-2 years I see AI handling tier-1 triage entirely, and I am positioning myself as the AI champion for our group.'
    );
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const cause = (err as { cause?: unknown })?.cause;
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      cause: cause instanceof Error
        ? { message: cause.message, code: (cause as NodeJS.ErrnoException).code }
        : String(cause ?? ''),
    });
  }
}
