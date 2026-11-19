import { NextResponse } from 'next/server';
import { PassportError, deleteEntry, loadForAdmin, saveEntry } from '@/lib/passport/admin-ops';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };

function failure(error: unknown) {
  if (error instanceof PassportError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('passport api', error);
  return NextResponse.json(
    { error: 'Could not reach passport storage. Check BLOB_READ_WRITE_TOKEN and try again.' },
    { status: 500 }
  );
}

/** All entries, or one with ?slug=. Drafts included. */
export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug');
    const data = await loadForAdmin();
    if (!slug) return NextResponse.json(data, { headers: noStore });
    const entry = data.entries.find((e) => e.slug === slug);
    if (!entry) return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
    return NextResponse.json({ entry }, { headers: noStore });
  } catch (error) {
    return failure(error);
  }
}

/** Body: { entry, originalSlug } */
export async function POST(request: Request) {
  let body: { entry?: unknown; originalSlug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  try {
    const original = typeof body.originalSlug === 'string' && body.originalSlug ? body.originalSlug : null;
    const entry = await saveEntry(body.entry, original);
    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
  try {
    await deleteEntry(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
