import type { PassportEntry } from '@/domain/types/passport';
import { kindMeta } from '@/lib/passport/kinds';
import { dateRange, formatNumber } from '@/lib/passport/format';
import { entryDays, entryHighest } from '@/lib/passport/stats';

interface Fact {
  label: string;
  value: string;
}

/** The facts that apply to this kind of entry, skipping blanks. */
function factsFor(entry: PassportEntry): Fact[] {
  const meta = kindMeta(entry.kind);
  const dream = entry.status === 'dream';
  const days = entryDays(entry);
  const high = entryHighest(entry);
  const facts: Fact[] = [
    dream
      ? { label: 'Target', value: entry.target || 'Someday' }
      : { label: 'When', value: dateRange(entry.startDate, entry.endDate) },
  ];
  if (meta.days && days > 0) facts.push({ label: 'Days', value: String(days) });
  if (meta.altitude && high) facts.push({ label: 'Highest point', value: `${formatNumber(high)} m` });
  if (meta.distance && entry.distanceKm) {
    facts.push({ label: 'Distance', value: `${formatNumber(entry.distanceKm)} km` });
  }
  if (entry.place) facts.push({ label: 'Where', value: entry.place });
  if (meta.companions && entry.companions) facts.push({ label: 'With', value: entry.companions });
  return facts.filter((f) => f.value);
}

export function EntryFacts({ entry }: { entry: PassportEntry }) {
  const facts = factsFor(entry);
  if (facts.length < 2) return null;

  return (
    <dl className="pp-facts">
      {facts.map((f) => (
        <div key={f.label} className="pp-fact">
          <dt className="pp-label">{f.label}</dt>
          <dd className="m-0">
            <b>{f.value}</b>
          </dd>
        </div>
      ))}
    </dl>
  );
}
