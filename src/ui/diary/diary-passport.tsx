import Link from 'next/link';
import type { EntryKind, PassportEntry } from '@/domain/types/passport';
import { passportPath } from '@/domain/types/passport';
import { dateRange } from '@/lib/passport/format';
import { kindMeta, kinds } from '@/lib/passport/kinds';
import { passportStats } from '@/lib/passport/stats';
import { InkFilters } from '@/ui/passport/ink-filters';
import { Stamp, type StampEntry } from '@/ui/passport/stamp';

/** Stamps pressed into the diary; the rest live in the full passport. */
const STAMP_LIMIT = 12;
const TRIP_LIMIT = 8;

/** A dashed stamp holding a kind's place until its first entry. */
function ghost(kind: EntryKind): StampEntry {
  const meta = kindMeta(kind);
  return {
    slug: `ghost-${kind}`,
    kind,
    status: 'dream',
    title: `First ${meta.label.toLowerCase()}`,
    place: meta.label,
    startDate: '',
    endDate: '',
    target: 'Pending',
    stamp: { shape: meta.shape, ink: meta.ink },
    days: [],
    maxAltitudeM: null,
  };
}

function Mark({ children }: { children: string }) {
  return (
    <span className="d-mark" aria-hidden="true">
      {children}
    </span>
  );
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * The passport and the travel log, written into the diary as one more
 * section of the file: stamps, the trips behind them, and what is next.
 */
export function DiaryPassport({ entries }: { entries: PassportEntry[] }) {
  const done = entries.filter((e) => e.status === 'done');
  const dreams = entries.filter((e) => e.status === 'dream');
  const trips = done.filter((e) => e.kind === 'trek' || e.kind === 'travel');
  const stats = passportStats(entries);

  const stamps: { key: string; entry: StampEntry; href: string | null; caption: string }[] = done
    .slice(0, STAMP_LIMIT)
    .map((e) => ({ key: e.slug, entry: e, href: passportPath(e), caption: e.title }));
  for (const k of kinds) {
    if (!done.some((e) => e.kind === k.kind)) {
      stamps.push({ key: `ghost-${k.kind}`, entry: ghost(k.kind), href: null, caption: `first ${k.label.toLowerCase()}` });
    }
  }

  return (
    <section id="passport" className="d-pp" aria-labelledby="passport-title">
      <InkFilters />

      <h2 id="passport-title" className="d-h2 d-r">
        <Mark>##</Mark>
        passport
      </h2>

      <p className="d-pp-stats d-r">
        {plural(stats.stamps, 'stamp', 'stamps')} · {plural(stats.places, 'place', 'places')} ·{' '}
        {plural(stats.daysOut, 'day', 'days')} out there
      </p>

      <ul className="d-stamps">
        {stamps.map((s) => {
          const body = (
            <>
              <Stamp entry={s.entry} idSuffix="-diary" className="d-stamp-svg" />
              <span className="d-stamp-caption">{s.caption}</span>
            </>
          );
          return (
            <li key={s.key} className="d-stamp d-r" data-ghost={s.href ? undefined : true}>
              {s.href ? (
                <Link href={s.href} aria-label={s.caption}>
                  {body}
                </Link>
              ) : (
                <div aria-label={`${s.caption}, not stamped yet`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <h3 className="d-h3 d-r">
        <Mark>###</Mark>
        travel
      </h3>

      {trips.length > 0 ? (
        <ul className="d-trips">
          {trips.slice(0, TRIP_LIMIT).map((t) => (
            <li key={t.slug} className="d-trip d-r">
              <Mark>-</Mark>
              <Link href={passportPath(t)} className="d-trip-title">
                {t.title}
              </Link>
              <span className="d-trip-meta">
                {[t.place, dateRange(t.startDate, t.endDate)].filter(Boolean).join(' · ')}
              </span>
              {t.summary && <span className="d-trip-summary">{t.summary}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="d-p d-pp-empty d-r">No trips stamped yet. The first one lands here.</p>
      )}

      {dreams.length > 0 && (
        <>
          <h3 className="d-h3 d-r">
            <Mark>###</Mark>
            next up
          </h3>
          <ul className="d-list">
            {dreams.slice(0, 6).map((d) => (
              <li key={d.slug} className="d-r">
                <Mark>- [ ]</Mark>
                <Link href={passportPath(d)}>{d.title}</Link>
                <span className="d-trip-meta">
                  {' '}
                  · {[d.place, d.target || 'someday'].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="d-pp-links d-r">
        <Link href="/passport">open the passport →</Link>
        <Link href="/passport/wall">memory wall →</Link>
      </p>
    </section>
  );
}
