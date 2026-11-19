import Link from 'next/link';
import type { PassportEntry } from '@/domain/types/passport';
import { kindMeta } from '@/lib/passport/kinds';
import { Photo } from './photo';
import { Stamp } from './stamp';

function coverUrl(entry: PassportEntry): string {
  if (entry.cover && entry.photos.some((p) => p.url === entry.cover)) return entry.cover;
  return entry.photos[0]?.url ?? '';
}

/** Cover photo with the stamp pressed onto its corner, then the title block. */
export function EntryHero({ entry }: { entry: PassportEntry }) {
  const meta = kindMeta(entry.kind);
  const dream = entry.status === 'dream';
  const eyebrow = [dream ? 'Wish list' : meta.label, entry.place].filter(Boolean).join(' · ');

  return (
    <section className="grid items-end gap-7 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="pp-cover-photo">
        <Photo src={coverUrl(entry)} seed={entry.slug} alt={`Cover photo: ${entry.title}`} className="h-full w-full rounded object-cover" />
        <Stamp entry={entry} idSuffix="-hero" />
      </div>
      <div className="min-w-0">
        <p className="pp-label mb-2.5">{eyebrow}</p>
        <h1 className="pp-display text-balance text-[clamp(40px,7vw,76px)] font-black leading-[0.92]">
          {entry.title}
        </h1>
        {entry.summary && (
          <p className="pp-hand mt-3.5 max-w-[32ch] text-[27px] leading-tight" style={{ color: 'var(--pp-blue)' }}>
            {entry.summary}
          </p>
        )}
        <div className="mt-5">
          <Link href="/passport" className="pp-btn">
            ← Passport
          </Link>
        </div>
      </div>
    </section>
  );
}
