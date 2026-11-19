import type { ReactNode } from 'react';
import type { PassportEntry } from '@/domain/types/passport';
import { formatNumber, paragraphs, youtubeId } from '@/lib/passport/format';
import { YouTube } from '@/ui/common';
import { ElevationProfile } from './elevation-profile';
import { GalleryPhoto } from './gallery';
import { NoteCard, Polaroid } from './pinned';

export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <div className="pp-sec-head">
        <h2>{title}</h2>
        {note && <span className="pp-label">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function StorySection({ story }: { story: string }) {
  const paras = paragraphs(story);
  if (!paras.length) return null;
  return (
    <Section title="The story">
      <div className="max-w-[65ch] space-y-4 text-[16px] leading-relaxed">
        {paras.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    </Section>
  );
}

export function ElevationSection({ entry }: { entry: PassportEntry }) {
  if (entry.days.filter((d) => d.altitudeM != null).length < 2) return null;
  return (
    <Section title="Elevation" note="metres above sea level, by day">
      <ElevationProfile days={entry.days} />
    </Section>
  );
}

export function DaysSection({ entry }: { entry: PassportEntry }) {
  if (!entry.days.length) return null;
  const urls = new Set(entry.photos.map((p) => p.url));
  return (
    <Section title="Day by day" note={`${entry.days.length} ${entry.days.length === 1 ? 'entry' : 'entries'}`}>
      <ol className="m-0 list-none p-0">
        {entry.days.map((day, i) => {
          const photo = day.photo && urls.has(day.photo) ? day.photo : '';
          return (
            <li key={i} className={`pp-day ${photo ? '' : 'no-photo'}`}>
              <div className="flex items-baseline gap-3 md:block">
                <b className="pp-display block text-[30px] font-black leading-none">Day {i + 1}</b>
                {day.altitudeM != null && (
                  <span className="font-mono text-xs" style={{ color: 'var(--pp-green)' }}>
                    {formatNumber(day.altitudeM)} m
                  </span>
                )}
              </div>
              <div className="min-w-0">
                {day.place && <h3 className="pp-display text-[21px] font-extrabold tracking-wide">{day.place}</h3>}
                {day.note && <p className="mt-1 max-w-[62ch] whitespace-pre-wrap">{day.note}</p>}
              </div>
              {photo && (
                <GalleryPhoto url={photo} alt={day.place} className="aspect-[4/3] w-full rounded object-cover shadow-[var(--pp-shadow)]" />
              )}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

export function InsightsSection({ entry }: { entry: PassportEntry }) {
  const notes = entry.insights.filter(Boolean);
  if (!notes.length) return null;
  const title = entry.status === 'dream' ? 'Why I want to go' : 'What it taught me';
  return (
    <Section title={title}>
      <div className="grid gap-6 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {notes.map((text, i) => (
          <NoteCard key={i} text={text} seed={`${entry.slug}${i}`} />
        ))}
      </div>
    </Section>
  );
}

export function VideosSection({ entry }: { entry: PassportEntry }) {
  const ids = entry.videos.map(youtubeId).filter((id): id is string => Boolean(id));
  if (!ids.length) return null;
  return (
    <Section title={ids.length === 1 ? 'The film' : 'Films'}>
      <div className="max-w-content">
        {ids.map((id, i) => (
          <YouTube key={id} id={id} title={ids.length > 1 ? `${entry.title}, part ${i + 1}` : entry.title} />
        ))}
      </div>
    </Section>
  );
}

export function PhotosSection({ entry }: { entry: PassportEntry }) {
  if (!entry.photos.length) return null;
  return (
    <Section title="Photo board" note={`${entry.photos.length} ${entry.photos.length === 1 ? 'photo' : 'photos'}`}>
      <div className="pp-board">
        {entry.photos.map((photo, i) => (
          <Polaroid key={photo.url} photo={photo} seed={`${entry.slug}${i}`} />
        ))}
      </div>
    </Section>
  );
}
