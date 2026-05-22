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
    const baseUrl = endpoint.replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a JSON API. Reply only with valid JSON.' },
          { role: 'user',   content: 'Return this JSON exactly: {"status":"ok"}' },
        ],
        max_tokens: 64,
        temperature: 0.5,
        top_p: 1,
        stream: false,
      }),
    });

    const body = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      url,
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
