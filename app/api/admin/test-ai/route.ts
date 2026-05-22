import { NextResponse } from 'next/server';

// GET /api/admin/test-ai — smoke-test the Trend Micro AI endpoint
// Returns the raw response (or error) so we can debug without a full assessment retake.
export async function GET() {
  const endpoint = process.env.AI_ENDPOINT_URL;
  const apiKey   = process.env.ANTHROPIC_API_KEY;
  const model    = process.env.AI_MODEL ?? 'claude-4.6-opus';

  if (!endpoint || !apiKey) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      AI_ENDPOINT_URL: endpoint ?? '(not set)',
      ANTHROPIC_API_KEY: apiKey ? '(set)' : '(not set)',
      AI_MODEL: model,
    });
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 32,
        messages: [{ role: 'user', content: 'Reply with just the word PONG.' }],
      }),
    });

    const body = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      endpoint,
      model,
      responseBody: body,
    });
  } catch (err) {
    const cause = (err as { cause?: unknown })?.cause;
    return NextResponse.json({
      ok: false,
      endpoint,
      model,
      error: err instanceof Error ? err.message : String(err),
      cause: cause instanceof Error
        ? { message: cause.message, code: (cause as NodeJS.ErrnoException).code }
        : String(cause ?? ''),
    });
  }
}
