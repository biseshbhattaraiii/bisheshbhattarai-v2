import { NextResponse } from 'next/server';
import {
  NewsletterError,
  isValidEmail,
  subscribe,
} from '@/lib/newsletter';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/** Public endpoint — rate limited, and it never reveals list membership. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, 'subscribe'), 5, 600);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let email = '';
  let honeypot = '';
  try {
    const body = (await request.json()) as {
      email?: unknown;
      company?: unknown;
    };
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    honeypot = typeof body.company === 'string' ? body.company : '';
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  // Bots fill in every field they find; humans never see this one.
  if (honeypot) {
    return NextResponse.json({ ok: true, status: 'subscribed' });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'That does not look like an email address.' },
      { status: 400 }
    );
  }

  try {
    const status = await subscribe(email);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    if (error instanceof NewsletterError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('subscribe failed', error);
    return NextResponse.json(
      { error: 'Could not sign you up just now.' },
      { status: 500 }
    );
  }
}
