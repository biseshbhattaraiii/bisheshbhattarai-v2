import { NextResponse } from 'next/server';
import { DeepSeekError, isDeepSeekConfigured } from '@/lib/ai/deepseek';
import { MAX_INPUT_CHARS, proofread } from '@/lib/ai/proofread';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Grammar assist for the editor.
 *
 * Behind the admin session (see middleware). Returns suggestions only —
 * it never returns rewritten text, so nothing can be applied without the
 * author choosing it.
 */
export async function POST(request: Request) {
  if (!isDeepSeekConfigured()) {
    return NextResponse.json(
      { error: 'DEEPSEEK_API_KEY is not set on the server.' },
      { status: 503 }
    );
  }

  const limit = rateLimit(clientKey(request, 'proofread'), 30, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Slow down. Too many checks in the last minute.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let text = '';
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === 'string' ? body.text : '';
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const trimmed = text.trim();
  if (trimmed.length < 12) {
    return NextResponse.json({ suggestions: [], truncated: false });
  }

  if (text.length > MAX_INPUT_CHARS * 4) {
    return NextResponse.json(
      { error: 'That is too much text to check in one pass.' },
      { status: 413 }
    );
  }

  try {
    const result = await proofread(text, AbortSignal.timeout(45_000));
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof DeepSeekError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'The grammar check timed out.' },
        { status: 504 }
      );
    }
    console.error('proofread failed', error);
    return NextResponse.json(
      { error: 'The grammar check failed.' },
      { status: 500 }
    );
  }
}
