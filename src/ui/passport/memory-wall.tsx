'use client';

import { useMemo, useState } from 'react';
import type { EntryKind, PassportEntry, Photo } from '@/domain/types/passport';
import { passportPath } from '@/domain/types/passport';
import { hashString } from '@/lib/passport/format';
import { kinds } from '@/lib/passport/kinds';
import { GalleryProvider } from './gallery';
import { NoteCard, Polaroid } from './pinned';

type Pin =
  | { type: 'photo'; key: string; entry: PassportEntry; photo: Photo }
  | { type: 'note'; key: string; entry: PassportEntry; text: string };

/** Photos and notes from every entry, shuffled the same way every visit. */
function pinsFor(entries: PassportEntry[]): Pin[] {
  const pins: Pin[] = entries.flatMap((entry) => [
    ...entry.photos.map((photo): Pin => ({ type: 'photo', key: `${entry.slug}:${photo.url}`, entry, photo })),
    ...entry.insights
      .filter(Boolean)
      .map((text, i): Pin => ({ type: 'note', key: `${entry.slug}:n${i}`, entry, text })),
  ]);
  return pins.sort((a, b) => hashString(a.key) - hashString(b.key));
}

/** Everything pinned together, filterable by kind. */
export function MemoryWall({ entries }: { entries: PassportEntry[] }) {
  const [kind, setKind] = useState<EntryKind | 'all'>('all');
  const all = useMemo(() => pinsFor(entries), [entries]);
  const present = kinds.filter((k) => all.some((p) => p.entry.kind === k.kind));
  const pins = kind === 'all' ? all : all.filter((p) => p.entry.kind === kind);
  const photos = pins.flatMap((p) => (p.type === 'photo' ? [p.photo] : []));

  return (
    <GalleryProvider photos={photos}>
      {present.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-1.5" role="group" aria-label="Filter the wall">
          <button type="button" className="pp-chip" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>
            Everything
          </button>
          {present.map((k) => (
            <button key={k.kind} type="button" className="pp-chip" aria-pressed={kind === k.kind} onClick={() => setKind(k.kind)}>
              {k.plural}
            </button>
          ))}
        </div>
      )}
      <div className="pp-board">
        {pins.map((pin) => {
          const from = { href: passportPath(pin.entry), title: pin.entry.title };
          return pin.type === 'photo' ? (
            <Polaroid key={pin.key} photo={pin.photo} seed={pin.key} from={from} />
          ) : (
            <NoteCard key={pin.key} text={pin.text} seed={pin.key} from={from} />
          );
        })}
      </div>
    </GalleryProvider>
  );
}
