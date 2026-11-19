import { z } from 'zod';
import type { PassportData } from '@/domain/types/passport';

/**
 * One schema for both directions: stored JSON is parsed through it on
 * load, and the editor's payload is parsed through it on save. Defaults
 * keep older documents readable as fields are added.
 */

const nullableNumber = z
  .union([z.number(), z.string(), z.null()])
  .transform((v) => {
    if (v === null || v === '') return null;
    const n = typeof v === 'number' ? v : Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  })
  .default(null);

const isoDate = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal('')]).default('');

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const photoSchema = z.object({
  url: z.string().min(1),
  caption: z.string().max(300).default(''),
});

export const daySchema = z.object({
  place: z.string().max(200).default(''),
  altitudeM: nullableNumber,
  note: z.string().max(5000).default(''),
  photo: z.string().default(''),
});

export const entrySchema = z.object({
  slug: z.string().regex(SLUG_PATTERN, 'Slug must be lowercase words joined by hyphens.'),
  kind: z.enum(['trek', 'travel', 'hobby', 'insight', 'video']),
  status: z.enum(['done', 'dream']).default('done'),
  title: z.string().trim().min(1, 'Give it a title.').max(120),
  place: z.string().max(120).default(''),
  startDate: isoDate,
  endDate: isoDate,
  target: z.string().max(60).default(''),
  summary: z.string().max(400).default(''),
  story: z.string().max(40000).default(''),
  distanceKm: nullableNumber,
  maxAltitudeM: nullableNumber,
  companions: z.string().max(200).default(''),
  stamp: z
    .object({
      shape: z.enum(['circle', 'rect', 'hex', 'peak', 'oval']).default('circle'),
      ink: z.enum(['red', 'blue', 'violet', 'green', 'ochre']).default('red'),
    })
    .default({}),
  cover: z.string().default(''),
  photos: z.array(photoSchema).max(200).default([]),
  days: z.array(daySchema).max(120).default([]),
  insights: z.array(z.string().max(2000)).max(50).default([]),
  videos: z.array(z.string().max(200)).max(20).default([]),
  published: z.boolean().default(true),
  createdAt: z.string().default(''),
  updatedAt: z.string().default(''),
});

export const holderSchema = z.object({
  name: z.string().max(80).default(''),
  homeBase: z.string().max(80).default(''),
  motto: z.string().max(200).default(''),
  photo: z.string().default(''),
});

export const passportSchema = z.object({
  holder: holderSchema.default({}),
  entries: z.array(entrySchema).default([]),
});

export const EMPTY_PASSPORT: PassportData = passportSchema.parse({});

/** Parses stored JSON, dropping entries that no longer validate. */
export function parseStored(raw: unknown): PassportData {
  const base = passportSchema.omit({ entries: true }).safeParse(raw ?? {});
  const holder = base.success ? base.data.holder : EMPTY_PASSPORT.holder;
  const list = Array.isArray((raw as { entries?: unknown })?.entries)
    ? ((raw as { entries: unknown[] }).entries)
    : [];
  const entries = list.flatMap((e) => {
    const parsed = entrySchema.safeParse(e);
    return parsed.success ? [parsed.data] : [];
  });
  return { holder, entries };
}
