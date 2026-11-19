import type { PassportData } from '../types/passport';

/**
 * Where the passport lives.
 *
 * The data is one small JSON document; photos are separate files with
 * public URLs. Production keeps both in Vercel Blob, development keeps
 * them on disk.
 */
export interface PassportStore {
  /** Human name for the admin screen, e.g. "Vercel Blob". */
  readonly label: string;
  load(): Promise<PassportData>;
  save(data: PassportData): Promise<void>;
  /** Stores a photo and resolves its public URL. */
  putMedia(name: string, body: Blob, contentType: string): Promise<string>;
  /** Removes a photo by the URL putMedia returned. Never throws. */
  deleteMedia(url: string): Promise<void>;
}
