import type { PassportStore } from '@/domain/ports/passport-store';
import { BlobPassportStore } from './blob-store';
import { LocalPassportStore } from './local-store';

export { SLUG_PATTERN, entrySchema, holderSchema, EMPTY_PASSPORT } from './schema';

/** Blob when its token is set, otherwise local files. */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

let store: PassportStore | null = null;

export function passportStore(): PassportStore {
  store ??= isBlobConfigured() ? new BlobPassportStore() : new LocalPassportStore();
  return store;
}
