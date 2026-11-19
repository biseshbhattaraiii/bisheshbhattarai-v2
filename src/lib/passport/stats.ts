import type { PassportEntry } from '@/domain/types/passport';
import { parseDay } from './format';

/** Days covered by an entry: the date range, else the number of day logs. */
export function entryDays(entry: PassportEntry): number {
  const a = parseDay(entry.startDate);
  const b = parseDay(entry.endDate);
  if (a && b && b >= a) return Math.round((b.getTime() - a.getTime()) / 864e5) + 1;
  if (a && !b) return Math.max(1, entry.days.length);
  return entry.days.length;
}

/** Highest point: the entry's own figure or the highest day log. */
export function entryHighest(entry: PassportEntry): number | null {
  const fromDays = entry.days
    .map((d) => d.altitudeM ?? 0)
    .reduce((m, v) => Math.max(m, v), 0);
  const best = Math.max(entry.maxAltitudeM ?? 0, fromDays);
  return best > 0 ? best : null;
}

/** Newest first; undated entries last. */
export function byDateDesc(a: PassportEntry, b: PassportEntry): number {
  const left = a.startDate || a.createdAt;
  const right = b.startDate || b.createdAt;
  return right.localeCompare(left);
}

export interface PassportStats {
  stamps: number;
  daysOut: number;
  highest: number | null;
  kmOnFoot: number;
  firstEntry: string;
}

/** Totals for the holder page, over walked (not dreamed) entries. */
export function passportStats(entries: PassportEntry[]): PassportStats {
  const done = entries.filter((e) => e.status === 'done');
  const outdoors = done.filter((e) => e.kind === 'trek' || e.kind === 'travel');
  const highest = done
    .map(entryHighest)
    .reduce<number>((m, v) => Math.max(m, v ?? 0), 0);
  const dates = done.map((e) => e.startDate).filter(Boolean).sort();

  return {
    stamps: done.length,
    daysOut: outdoors.reduce((sum, e) => sum + entryDays(e), 0),
    highest: highest > 0 ? highest : null,
    kmOnFoot: done
      .filter((e) => e.kind === 'trek')
      .reduce((sum, e) => sum + (e.distanceKm ?? 0), 0),
    firstEntry: dates[0] ?? '',
  };
}

/** Machine-readable zone, the two lines at the foot of a passport's ID page. */
export function mrzLines(name: string, homeBase: string, stats: PassportStats): [string, string] {
  const letters = (v: string) => v.toUpperCase().replace(/[^A-Z]+/g, '<');
  const pad = (v: string) => v.padEnd(44, '<').slice(0, 44);
  const num = (n: number, width: number) => String(Math.round(n)).padStart(width, '0');
  return [
    pad(`P<TRL${letters(name || 'TRAVELLER')}<<${letters(homeBase)}`),
    pad(
      `${num(stats.stamps, 3)}STAMPS<${num(stats.daysOut, 4)}DAYS<${num(stats.highest ?? 0, 5)}M<${num(stats.kmOnFoot, 5)}KM`
    ),
  ];
}
