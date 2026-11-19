import type { DayLog, EntryKind, EntryStatus, PassportEntry } from '@/domain/types/passport';
import { kindMeta } from '@/lib/passport/kinds';

/** Form state: numbers stay as typed text until saved. */
export interface DayDraft extends Omit<DayLog, 'altitudeM'> {
  altitudeM: string;
}

export interface Draft
  extends Omit<PassportEntry, 'distanceKm' | 'maxAltitudeM' | 'days' | 'createdAt' | 'updatedAt'> {
  distanceKm: string;
  maxAltitudeM: string;
  days: DayDraft[];
}

/** Merges a change into the draft; pass a function to build it from the latest draft. */
export type Patch = (change: Partial<Draft> | ((latest: Draft) => Partial<Draft>)) => void;

const text = (n: number | null) => (n == null ? '' : String(n));
const number = (v: string) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export function toDraft(entry: PassportEntry): Draft {
  return {
    ...entry,
    distanceKm: text(entry.distanceKm),
    maxAltitudeM: text(entry.maxAltitudeM),
    days: entry.days.map((d) => ({ ...d, altitudeM: text(d.altitudeM) })),
  };
}

export function blankDraft(kind: EntryKind, status: EntryStatus, today: string): Draft {
  const meta = kindMeta(kind);
  return {
    slug: '',
    kind,
    status,
    title: '',
    place: '',
    startDate: status === 'done' ? today : '',
    endDate: '',
    target: '',
    summary: '',
    story: '',
    distanceKm: '',
    maxAltitudeM: '',
    companions: '',
    stamp: { shape: meta.shape, ink: meta.ink },
    cover: '',
    photos: [],
    days: [],
    insights: [],
    videos: [],
    published: true,
  };
}

/** What the API receives: blanks dropped, numbers parsed, dreams undated. */
export function toPayload(d: Draft) {
  const dream = d.status === 'dream';
  const meta = kindMeta(d.kind);
  return {
    ...d,
    startDate: dream ? '' : d.startDate,
    endDate: dream ? '' : d.endDate,
    target: dream ? d.target.trim() : '',
    distanceKm: meta.distance ? number(d.distanceKm) : null,
    maxAltitudeM: meta.altitude ? number(d.maxAltitudeM) : null,
    companions: meta.companions ? d.companions.trim() : '',
    days: meta.days
      ? d.days
          .filter((x) => x.place.trim() || x.note.trim() || x.altitudeM.trim())
          .map((x) => ({ ...x, altitudeM: meta.altitude ? number(x.altitudeM) : null }))
      : [],
    insights: d.insights.map((x) => x.trim()).filter(Boolean),
    videos: d.videos.map((x) => x.trim()).filter(Boolean),
    cover: d.photos.some((p) => p.url === d.cover) ? d.cover : (d.photos[0]?.url ?? ''),
  };
}

/** Replaces item `i` of a list immutably. */
export function replaceAt<T>(list: T[], i: number, value: T): T[] {
  return list.map((item, j) => (j === i ? value : item));
}

export function removeAt<T>(list: T[], i: number): T[] {
  return list.filter((_, j) => j !== i);
}
