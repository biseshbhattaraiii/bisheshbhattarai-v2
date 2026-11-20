'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { EntryKind, PassportEntry } from '@/domain/types/passport';
import { passportPath } from '@/domain/types/passport';
import { hashString } from '@/lib/passport/format';
import { kindMeta, kinds } from '@/lib/passport/kinds';
import { Stamp, type StampEntry } from '@/ui/passport/stamp';

/** Stamps shown on the spread; the rest live in the full passport. */
const LIMIT = 24;

/** A dashed, unlinked stamp holding a kind's place until its first entry. */
function ghost(kind: EntryKind, label: string): StampEntry {
  const meta = kindMeta(kind);
  return {
    slug: `ghost-${kind}`,
    kind,
    status: 'dream',
    title: `First ${label.toLowerCase()}`,
    place: label,
    startDate: '',
    endDate: '',
    target: 'Pending',
    stamp: { shape: meta.shape, ink: meta.ink },
    days: [],
    maxAltitudeM: null,
  };
}

/** A small nudge so the stamps sit where a hand pressed them, not on a grid. */
function scatter(seed: string, i: number) {
  const h = hashString(seed);
  const x = ((h % 29) - 14) * 0.9;
  const y = (((h >>> 5) % 25) - 12) * 0.9 + (i % 2 ? 10 : -4);
  return { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`, zIndex: (h >>> 9) % 5 };
}

type Item = { key: string; kind: EntryKind; entry: StampEntry; href: string | null; title: string };

function StampItem({ item, i, dim }: { item: Item; i: number; dim: boolean }) {
  const body = (
    <>
      <Stamp entry={item.entry} idSuffix="-home" className="home-stamp-svg" />
      <span className="home-stamp-caption pp-hand">{item.title}</span>
    </>
  );
  return (
    <li className="home-stamp" data-dim={dim || undefined} style={scatter(item.key, i)}>
      {item.href ? (
        <Link href={item.href} aria-label={item.title} tabIndex={dim ? -1 : undefined}>
          {body}
        </Link>
      ) : (
        <div aria-label={`${item.title}, not stamped yet`}>{body}</div>
      )}
    </li>
  );
}

/**
 * The passport, opened flat: every kind's stamps pressed across two
 * pages. Kinds with no entry yet keep a dashed "pending" stamp, so the
 * page always shows the whole range.
 */
export function PassportSpread({ entries, total }: { entries: PassportEntry[]; total: number }) {
  const [focus, setFocus] = useState<EntryKind | 'all'>('all');

  const shown = entries.slice(0, LIMIT);
  const items: Item[] = shown.map((e) => ({
    key: e.slug,
    kind: e.kind,
    entry: e,
    href: passportPath(e),
    title: e.title,
  }));
  for (const k of kinds) {
    if (!entries.some((e) => e.kind === k.kind)) {
      items.push({ key: `ghost-${k.kind}`, kind: k.kind, entry: ghost(k.kind, k.label), href: null, title: `First ${k.label.toLowerCase()}, pending` });
    }
  }
  // Mix the kinds across the pages instead of grouping them.
  items.sort((a, b) => hashString(`${a.key}~`) - hashString(`${b.key}~`));

  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);
  const count = (kind: EntryKind) => entries.filter((e) => e.kind === kind).length;

  return (
    <div>
      <div className="home-legend" role="group" aria-label="Show one kind of stamp">
        <button type="button" className="home-legend-chip" aria-pressed={focus === 'all'} onClick={() => setFocus('all')}>
          Everything <span>{total}</span>
        </button>
        {kinds.map((k) => (
          <button
            key={k.kind}
            type="button"
            className={`home-legend-chip ink-${k.ink}`}
            aria-pressed={focus === k.kind}
            onClick={() => setFocus(focus === k.kind ? 'all' : k.kind)}
          >
            <i aria-hidden="true" />
            {k.plural} <span>{count(k.kind)}</span>
          </button>
        ))}
      </div>

      <div className="home-spread">
        {[left, right].map((page, p) => (
          <section key={p} className="home-page" aria-label={p === 0 ? 'Left page' : 'Right page'}>
            <header className="home-page-head">
              <span>Visas</span>
              <span>Visas</span>
            </header>
            <ol className="home-stamps">
              {page.map((item, i) => (
                <StampItem key={item.key} item={item} i={i} dim={focus !== 'all' && item.kind !== focus} />
              ))}
            </ol>
            <footer className="home-page-foot">{p === 0 ? '04' : '05'}</footer>
          </section>
        ))}
      </div>
    </div>
  );
}
