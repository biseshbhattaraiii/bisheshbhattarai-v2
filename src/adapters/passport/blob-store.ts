import { del, list, put } from '@vercel/blob';
import type { PassportStore } from '@/domain/ports/passport-store';
import type { PassportData } from '@/domain/types/passport';
import { EMPTY_PASSPORT, parseStored } from './schema';

const DATA_PATH = 'passport/data.json';
const MEDIA_PREFIX = 'passport/media/';

/**
 * Vercel Blob: works from any host once BLOB_READ_WRITE_TOKEN is set.
 *
 * The data document is overwritten in place. Blob's CDN may hold an old
 * copy for up to a minute, so reads add the upload time as a query
 * string to always get the version `list` just reported.
 */
export class BlobPassportStore implements PassportStore {
  readonly label = 'Vercel Blob';

  async load(): Promise<PassportData> {
    const { blobs } = await list({ prefix: DATA_PATH, limit: 1 });
    const blob = blobs.find((b) => b.pathname === DATA_PATH);
    if (!blob) return EMPTY_PASSPORT;

    const version = new Date(blob.uploadedAt).getTime();
    const res = await fetch(`${blob.url}?v=${version}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Passport data fetch failed: ${res.status}`);
    return parseStored(await res.json());
  }

  async save(data: PassportData): Promise<void> {
    await put(DATA_PATH, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
  }

  async putMedia(name: string, body: Blob, contentType: string): Promise<string> {
    const result = await put(`${MEDIA_PREFIX}${name}`, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    });
    return result.url;
  }

  async deleteMedia(url: string): Promise<void> {
    if (!url.includes('.blob.vercel-storage.com/')) return;
    try {
      await del(url);
    } catch (error) {
      console.error('passport: could not delete media', error);
    }
  }
}
