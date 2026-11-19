/**
 * The passport: every trek, trip, hobby, insight and video is an entry,
 * and every entry earns a stamp.
 */

export type EntryKind = 'trek' | 'travel' | 'hobby' | 'insight' | 'video';

/** Walked it, or still on the wish list ("visa pending"). */
export type EntryStatus = 'done' | 'dream';

export type StampShape = 'circle' | 'rect' | 'hex' | 'peak' | 'oval';

export type InkColor = 'red' | 'blue' | 'violet' | 'green' | 'ochre';

export interface StampStyle {
  shape: StampShape;
  ink: InkColor;
}

export interface Photo {
  url: string;
  caption: string;
}

/** One day of a trek or trip. */
export interface DayLog {
  place: string;
  /** Where you slept, metres above sea level. Drives the elevation profile. */
  altitudeM: number | null;
  note: string;
  /** URL of one of the entry's photos, or empty. */
  photo: string;
}

export interface PassportEntry {
  slug: string;
  kind: EntryKind;
  status: EntryStatus;
  title: string;
  /** Region, country or city. */
  place: string;
  /** YYYY-MM-DD, empty for dreams. */
  startDate: string;
  endDate: string;
  /** Dreams only: "Spring 2027". */
  target: string;
  /** One line that captures it. */
  summary: string;
  /** The longer story, plain paragraphs separated by blank lines. */
  story: string;
  distanceKm: number | null;
  maxAltitudeM: number | null;
  companions: string;
  stamp: StampStyle;
  /** URL of the cover photo; falls back to the first photo. */
  cover: string;
  photos: Photo[];
  days: DayLog[];
  /** Lessons and reflections, shown as handwritten notes. */
  insights: string[];
  /** YouTube links or ids. */
  videos: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Holder {
  name: string;
  homeBase: string;
  motto: string;
  photo: string;
}

export interface PassportData {
  holder: Holder;
  entries: PassportEntry[];
}

/** Canonical path for an entry. */
export function passportPath(entry: Pick<PassportEntry, 'slug'>): string {
  return `/passport/${entry.slug}`;
}
