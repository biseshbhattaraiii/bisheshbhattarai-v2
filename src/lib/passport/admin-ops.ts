import { revalidatePath, revalidateTag } from 'next/cache';
import { passportStore } from '@/adapters/passport';
import { entrySchema, holderSchema } from '@/adapters/passport/schema';
import type { Holder, PassportData, PassportEntry } from '@/domain/types/passport';
import { PASSPORT_TAG } from './get-passport';

/** Slugs that collide with fixed routes under /passport. */
const RESERVED = new Set(['wall']);

export class PassportError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function refreshPublicPages() {
  revalidateTag(PASSPORT_TAG);
  revalidatePath('/passport', 'layout');
}

/** Every media URL still referenced anywhere in the passport. */
function referencedMedia(data: PassportData): Set<string> {
  const urls = new Set<string>();
  if (data.holder.photo) urls.add(data.holder.photo);
  for (const e of data.entries) for (const p of e.photos) urls.add(p.url);
  return urls;
}

async function dropUnreferenced(before: string[], data: PassportData) {
  const keep = referencedMedia(data);
  const store = passportStore();
  await Promise.all(before.filter((u) => !keep.has(u)).map((u) => store.deleteMedia(u)));
}

/**
 * Creates or updates an entry. `originalSlug` is the slug the editor
 * opened, so renaming an entry replaces it instead of duplicating it.
 */
export async function saveEntry(payload: unknown, originalSlug: string | null): Promise<PassportEntry> {
  const parsed = entrySchema.safeParse(payload);
  if (!parsed.success) {
    throw new PassportError(parsed.error.issues[0]?.message ?? 'That entry is not valid.', 400);
  }
  const entry = parsed.data;
  if (RESERVED.has(entry.slug)) throw new PassportError(`"${entry.slug}" is reserved. Pick another slug.`, 400);

  const store = passportStore();
  const data = await store.load();
  const previous = originalSlug ? data.entries.find((e) => e.slug === originalSlug) : undefined;
  const clash = data.entries.find((e) => e.slug === entry.slug && e !== previous);
  if (clash) throw new PassportError('Another entry already uses that slug.', 409);

  const now = new Date().toISOString();
  const saved: PassportEntry = { ...entry, createdAt: previous?.createdAt || now, updatedAt: now };
  const others = data.entries.filter((e) => e !== previous);
  const next: PassportData = { ...data, entries: [...others, saved] };

  await store.save(next);
  await dropUnreferenced(previous?.photos.map((p) => p.url) ?? [], next);
  refreshPublicPages();
  return saved;
}

export async function deleteEntry(slug: string): Promise<void> {
  const store = passportStore();
  const data = await store.load();
  const entry = data.entries.find((e) => e.slug === slug);
  if (!entry) throw new PassportError('Entry not found.', 404);

  const next: PassportData = { ...data, entries: data.entries.filter((e) => e !== entry) };
  await store.save(next);
  await dropUnreferenced(entry.photos.map((p) => p.url), next);
  refreshPublicPages();
}

export async function saveHolder(payload: unknown): Promise<Holder> {
  const parsed = holderSchema.safeParse(payload);
  if (!parsed.success) throw new PassportError('Those details are not valid.', 400);

  const store = passportStore();
  const data = await store.load();
  const before = data.holder.photo ? [data.holder.photo] : [];
  const next: PassportData = { ...data, holder: parsed.data };
  await store.save(next);
  await dropUnreferenced(before, next);
  refreshPublicPages();
  return parsed.data;
}

/** Admin reads skip the public cache: the editor must see its own saves. */
export async function loadForAdmin(): Promise<PassportData> {
  return passportStore().load();
}
