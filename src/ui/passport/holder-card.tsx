import type { Holder, PassportEntry } from '@/domain/types/passport';
import { formatNumber, stampDate } from '@/lib/passport/format';
import { mrzLines, passportStats } from '@/lib/passport/stats';
import { Photo } from './photo';

interface HolderCardProps {
  holder: Holder;
  entries: PassportEntry[];
  /** Shown when the holder page has not been filled in. */
  fallbackName: string;
}

/** The identity page: photo, particulars, running totals and the MRZ. */
export function HolderCard({ holder, entries, fallbackName }: HolderCardProps) {
  const name = holder.name || fallbackName;
  const stats = passportStats(entries);
  const [line1, line2] = mrzLines(name, holder.homeBase, stats);

  const tiles = [
    { value: formatNumber(stats.stamps), unit: '', label: 'Stamps' },
    { value: formatNumber(stats.places), unit: '', label: 'Places' },
    { value: formatNumber(stats.ideas), unit: '', label: 'Ideas & lessons' },
    { value: formatNumber(stats.daysOut), unit: '', label: 'Days out there' },
  ];

  return (
    <section className="pp-idpage" aria-label="Passport holder">
      <Photo src={holder.photo} seed="holder" alt={holder.photo ? `Photo of ${name}` : ''} className="pp-idphoto" />
      <dl className="pp-idfields">
        <div>
          <dt className="pp-label">Holder</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt className="pp-label">Home base</dt>
          <dd>{holder.homeBase || '—'}</dd>
        </div>
        <div>
          <dt className="pp-label">First entry</dt>
          <dd>{stampDate(stats.firstEntry) || '—'}</dd>
        </div>
        <div className="col-span-full">
          <dt className="pp-label">Motto</dt>
          <dd className="pp-motto">{holder.motto || 'Walk slowly. Look up often.'}</dd>
        </div>
      </dl>
      <div className="pp-stats">
        {tiles.map((t) => (
          <div key={t.label} className="pp-stat">
            <b>
              {t.value}
              {t.unit && <small>{t.unit}</small>}
            </b>
            <span className="pp-label">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="pp-mrz" aria-hidden="true">
        {line1}
        {'\n'}
        {line2}
      </div>
    </section>
  );
}
