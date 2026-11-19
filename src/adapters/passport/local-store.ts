import fs from 'fs/promises';
import path from 'path';
import type { PassportStore } from '@/domain/ports/passport-store';
import type { PassportData } from '@/domain/types/passport';
import { EMPTY_PASSPORT, parseStored } from './schema';

const DATA_FILE = path.join(process.cwd(), '.data', 'passport.json');
const MEDIA_DIR = path.join(process.cwd(), 'public', 'uploads', 'passport');
const MEDIA_URL = '/uploads/passport/';

/**
 * Development store: the data in .data/passport.json and photos in
 * public/uploads/passport. Both paths are git-ignored. Production hosts
 * usually have a read-only disk, which is why Blob exists.
 */
export class LocalPassportStore implements PassportStore {
  readonly label = 'local files (development)';

  async load(): Promise<PassportData> {
    try {
      return parseStored(JSON.parse(await fs.readFile(DATA_FILE, 'utf-8')));
    } catch {
      return EMPTY_PASSPORT;
    }
  }

  async save(data: PassportData): Promise<void> {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  async putMedia(name: string, body: Blob): Promise<string> {
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${name}`;
    await fs.mkdir(MEDIA_DIR, { recursive: true });
    await fs.writeFile(path.join(MEDIA_DIR, unique), Buffer.from(await body.arrayBuffer()));
    return `${MEDIA_URL}${unique}`;
  }

  async deleteMedia(url: string): Promise<void> {
    if (!url.startsWith(MEDIA_URL)) return;
    const file = path.join(MEDIA_DIR, path.basename(url));
    await fs.unlink(file).catch(() => undefined);
  }
}
