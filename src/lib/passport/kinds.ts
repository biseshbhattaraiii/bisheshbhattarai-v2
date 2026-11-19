import type { EntryKind, InkColor, StampShape } from '@/domain/types/passport';

/**
 * Kinds of entry. Each gets its own default stamp, so the passport reads
 * as a mix at a glance, and its own set of form fields.
 *
 * Adding a kind: extend EntryKind and the schema enum, then add a row here.
 */
export interface KindMeta {
  kind: EntryKind;
  label: string;
  plural: string;
  /** One line shown in the editor's kind picker. */
  hint: string;
  shape: StampShape;
  ink: InkColor;
  /** Printed on the stamp when there is no number to show. */
  stampWord: string;
  /** Day-by-day log. */
  days: boolean;
  /** Altitude fields and the elevation profile. */
  altitude: boolean;
  distance: boolean;
  companions: boolean;
}

export const kinds: KindMeta[] = [
  {
    kind: 'trek',
    label: 'Trek',
    plural: 'Treks',
    hint: 'A trail on foot: days, altitude, distance.',
    shape: 'circle',
    ink: 'red',
    stampWord: 'SUMMIT',
    days: true,
    altitude: true,
    distance: true,
    companions: true,
  },
  {
    kind: 'travel',
    label: 'Travel',
    plural: 'Trips',
    hint: 'A trip or a place: where you went and what happened.',
    shape: 'rect',
    ink: 'blue',
    stampWord: 'ENTRY',
    days: true,
    altitude: false,
    distance: false,
    companions: true,
  },
  {
    kind: 'hobby',
    label: 'Hobby',
    plural: 'Hobbies',
    hint: 'Something you make, practise or learn.',
    shape: 'hex',
    ink: 'green',
    stampWord: 'PRACTICE',
    days: false,
    altitude: false,
    distance: false,
    companions: false,
  },
  {
    kind: 'insight',
    label: 'Insight',
    plural: 'Insights',
    hint: 'A realisation worth keeping.',
    shape: 'oval',
    ink: 'violet',
    stampWord: 'NOTED',
    days: false,
    altitude: false,
    distance: false,
    companions: false,
  },
  {
    kind: 'video',
    label: 'Video',
    plural: 'Videos',
    hint: 'A travel film or vlog on YouTube.',
    shape: 'peak',
    ink: 'ochre',
    stampWord: 'FILMED',
    days: false,
    altitude: false,
    distance: false,
    companions: false,
  },
];

const byKind = new Map(kinds.map((k) => [k.kind, k]));

export function kindMeta(kind: EntryKind): KindMeta {
  return byKind.get(kind) ?? (kinds[0] as KindMeta);
}

export const INKS: InkColor[] = ['red', 'blue', 'violet', 'green', 'ochre'];

export const SHAPES: { shape: StampShape; label: string }[] = [
  { shape: 'circle', label: 'Round' },
  { shape: 'rect', label: 'Entry box' },
  { shape: 'hex', label: 'Hexagon' },
  { shape: 'peak', label: 'Summit' },
  { shape: 'oval', label: 'Oval' },
];
