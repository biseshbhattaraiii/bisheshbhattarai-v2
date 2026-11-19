import type { PassportEntry } from '@/domain/types/passport';
import { kindMeta } from '@/lib/passport/kinds';
import { formatNumber, hashString, stampDate, tilt } from '@/lib/passport/format';
import { entryDays, entryHighest } from '@/lib/passport/stats';
import { StampBody, fitSize, type StampFace } from './stamp-shapes';

export type StampEntry = Pick<
  PassportEntry,
  'slug' | 'kind' | 'status' | 'title' | 'place' | 'startDate' | 'endDate' | 'target' | 'stamp' | 'days' | 'maxAltitudeM'
>;

interface StampProps {
  entry: StampEntry;
  /** No rotation (editor preview, empty states). */
  flat?: boolean;
  /** Keeps textPath ids unique when one entry's stamp appears twice. */
  idSuffix?: string;
  className?: string;
}

/** The big line in the middle: altitude for treks, days for trips, else a word. */
function headline(entry: StampEntry): string {
  const meta = kindMeta(entry.kind);
  if (meta.altitude) {
    const high = entryHighest(entry as PassportEntry);
    if (high) return `${formatNumber(high)} M`;
  }
  if (meta.days) {
    const days = entryDays(entry as PassportEntry);
    if (days > 0) return `${days} ${days === 1 ? 'DAY' : 'DAYS'}`;
  }
  return meta.stampWord;
}

function face(entry: StampEntry, id: string): StampFace {
  const dream = entry.status === 'dream';
  const name = (entry.title || 'Untitled').toUpperCase().slice(0, 26);
  const date = dream
    ? (entry.target || 'Someday').toUpperCase().slice(0, 18)
    : stampDate(entry.startDate) || kindMeta(entry.kind).label.toUpperCase();
  return {
    id,
    name,
    nameSize: fitSize(name, 17, 200),
    region: (entry.place || kindMeta(entry.kind).label).toUpperCase(),
    headline: headline(entry),
    date,
    dashed: dream,
    kind: entry.kind,
  };
}

/**
 * A rubber stamp drawn in SVG. Ink texture comes from the filters in
 * <InkFilters />, which must be on the page once.
 */
export function Stamp({ entry, flat = false, idSuffix = '', className = '' }: StampProps) {
  const dream = entry.status === 'dream';
  const meta = kindMeta(entry.kind);
  const shape = entry.stamp?.shape ?? meta.shape;
  const ink = entry.stamp?.ink ?? meta.ink;
  const seed = `${entry.slug}${entry.title}`;
  const rotation = flat ? 0 : tilt(seed, 12);
  const id = `st-${entry.slug || 'draft'}${idSuffix}`;
  const label = `${dream ? 'Wish list' : 'Stamp'}: ${entry.title || 'Untitled'}`;

  return (
    <svg
      viewBox="-4 -4 208 208"
      role="img"
      aria-label={label}
      className={`ink-${ink} ${className}`}
      style={{ transform: `rotate(${rotation.toFixed(1)}deg)` }}
    >
      <g
        filter={dream ? undefined : `url(#pp-ink${hashString(seed) % 3})`}
        opacity={dream ? 0.7 : 1}
      >
        <StampBody shape={shape} face={face(entry, id)} />
      </g>
    </svg>
  );
}
