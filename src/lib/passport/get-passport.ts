import { unstable_cache } from 'next/cache';
import { passportStore } from '@/adapters/passport';
import { EMPTY_PASSPORT } from '@/adapters/passport/schema';
import type { PassportData, PassportEntry } from '@/domain/types/passport';
import { byDateDesc } from './stats';

/** Cache tag the admin API revalidates after every save. */
export const PASSPORT_TAG = 'passport';

/**
 * Public reads go through the Next data cache: one storage read per hour
 * at most, and immediately after the admin saves (revalidateTag).
 */
const loadCached = unstable_cache(
  async (): Promise<PassportData> => {
    try {
      return await passportStore().load();
    } catch (error) {
      console.error('passport: load failed', error);
      return EMPTY_PASSPORT;
    }
  },
  ['passport-data'],
  { tags: [PASSPORT_TAG], revalidate: 3600 }
);

/** Published entries only, newest first. */
export async function getPublicPassport(): Promise<PassportData> {
  const data = await loadCached();
  return {
    holder: data.holder,
    entries: data.entries.filter((e) => e.published).sort(byDateDesc),
  };
}

export async function getPublicEntry(slug: string): Promise<PassportEntry | null> {
  const { entries } = await getPublicPassport();
  return entries.find((e) => e.slug === slug) ?? null;
}
