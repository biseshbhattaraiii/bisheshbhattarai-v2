import { NextResponse } from 'next/server';
import { PassportError, saveHolder } from '@/lib/passport/admin-ops';

export const dynamic = 'force-dynamic';

/** Saves the holder page: name, home base, motto, photo. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  try {
    const holder = await saveHolder(body);
    return NextResponse.json({ ok: true, holder });
  } catch (error) {
    if (error instanceof PassportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('passport holder', error);
    return NextResponse.json({ error: 'Could not save. Try again.' }, { status: 500 });
  }
}
