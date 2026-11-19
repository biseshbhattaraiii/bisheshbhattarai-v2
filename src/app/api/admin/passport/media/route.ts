import { NextResponse } from 'next/server';
import { passportStore } from '@/adapters/passport';

export const dynamic = 'force-dynamic';

/** Serverless request bodies cap out around 4.5 MB; photos are resized before upload. */
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** Uploads one photo (form field "file") and returns its public URL. */
export async function POST(request: Request) {
  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: 'No photo received.' }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Use a JPEG, PNG, WebP or GIF photo.' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That photo is over 4 MB, even after resizing.' }, { status: 413 });
  }

  try {
    const url = await passportStore().putMedia(`photo.${ext}`, file, file.type);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error('passport media upload', error);
    return NextResponse.json({ error: 'Upload failed. Check BLOB_READ_WRITE_TOKEN and try again.' }, { status: 500 });
  }
}

/**
 * Removes a photo uploaded during an editing session that was then
 * abandoned. Photos still referenced by a saved entry are cleaned up by
 * the save itself, not here.
 */
export async function DELETE(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url.' }, { status: 400 });
  const data = await passportStore().load();
  const used =
    data.holder.photo === url || data.entries.some((e) => e.photos.some((p) => p.url === url));
  if (!used) await passportStore().deleteMedia(url);
  return NextResponse.json({ ok: true, deleted: !used });
}
