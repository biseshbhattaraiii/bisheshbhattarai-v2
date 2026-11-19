'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { EntryKind, PassportEntry } from '@/domain/types/passport';
import { passportPath } from '@/domain/types/passport';
import { kindMeta, kinds } from '@/lib/passport/kinds';
import { entryDays } from '@/lib/passport/stats';
import { shortDate } from '@/lib/passport/format';
import { Stamp } from './stamp';

function caption(entry: PassportEntry): string {
  if (entry.status === 'dream') return entry.target || 'Someday';
  const days = entryDays(entry);
  const parts = [kindMeta(entry.kind).label, shortDate(entry.startDate)];
  if (days > 1) parts.push(`${days} days`);
  return parts.filter(Boolean).join(' · ');
}

export function StampSlot({ entry }: { entry: PassportEntry }) {
  return (
    <Link href={passportPath(entry)} className="pp-slot">
      <Stamp entry={entry} />
      <span className="text-[13px] leading-snug">
        <b className="block font-semibold">{entry.title}</b>
        <span className="pp-muted">{caption(entry)}</span>
      </span>
    </Link>
  );
}

/** Every stamp, filterable by kind. */
export function StampShelf({ entries }: { entries: PassportEntry[] }) {
  const [kind, setKind] = useState<EntryKind | 'all'>('all');
  const present = kinds.filter((k) => entries.some((e) => e.kind === k.kind));
  const shown = kind === 'all' ? entries : entries.filter((e) => e.kind === kind);

  return (
    <>
      {present.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter stamps">
          <button type="button" className="pp-chip" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>
            Everything
          </button>
          {present.map((k) => (
            <button
              key={k.kind}
              type="button"
              className="pp-chip"
              aria-pressed={kind === k.kind}
              onClick={() => setKind(k.kind)}
            >
              {k.plural}
            </button>
          ))}
        </div>
      )}
      <div className="pp-stampgrid">
        {shown.map((entry) => (
          <StampSlot key={entry.slug} entry={entry} />
        ))}
      </div>
    </>
  );
}
