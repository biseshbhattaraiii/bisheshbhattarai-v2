/** Formatting shared by the stamps, the pages and the editor. Pure. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses YYYY-MM-DD as a local calendar date (no timezone shift). */
export function parseDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** "03 OCT 2026" — the rubber-stamp date. */
export function stampDate(value: string): string {
  const d = parseDay(value);
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${(MONTHS[d.getMonth()] ?? '').toUpperCase()} ${d.getFullYear()}`;
}

/** "3 Oct" */
export function shortDate(value: string): string {
  const d = parseDay(value);
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : '';
}

/** "3 – 12 Oct 2026", "28 Sep – 4 Oct 2026" or "3 Oct 2026". */
export function dateRange(start: string, end: string): string {
  const a = parseDay(start);
  if (!a) return '';
  const b = parseDay(end);
  if (!b || b.getTime() === a.getTime()) return `${shortDate(start)} ${a.getFullYear()}`;
  if (a.getFullYear() !== b.getFullYear()) {
    return `${shortDate(start)} ${a.getFullYear()} – ${shortDate(end)} ${b.getFullYear()}`;
  }
  const left = a.getMonth() === b.getMonth() ? String(a.getDate()) : shortDate(start);
  return `${left} – ${shortDate(end)} ${b.getFullYear()}`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Extracts a YouTube video id from a URL or a bare id. */
export function youtubeId(value: string): string | null {
  const v = value.trim();
  if (/^[\w-]{11}$/.test(v)) return v;
  const match =
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/.exec(v);
  return match?.[1] ?? null;
}

/** Splits the story into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Stable 32-bit hash, used for deterministic tilt and layout. */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic rotation in degrees, between -max and max. */
export function tilt(seed: string, max: number): number {
  return ((hashString(seed) % 1000) / 1000) * 2 * max - max;
}

/** Turns a title into a URL slug. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
