import Link from 'next/link';
import type { PassportEntry } from '@/domain/types/passport';
import { passportPath } from '@/domain/types/passport';
import { hashString, tilt, youtubeId } from '@/lib/passport/format';
import { kindMeta } from '@/lib/passport/kinds';

/* ── Ideas ─────────────────────────────────────────────────────────── */

interface Idea {
  key: string;
  text: string;
  entry: PassportEntry;
}

/** Idea entries first (their one-liner), then lessons noted on any entry. */
export function collectIdeas(entries: PassportEntry[], limit = 6): Idea[] {
  const own = entries
    .filter((e) => e.kind === 'insight' && e.status === 'done')
    .map((e) => ({ key: e.slug, text: e.summary || e.insights.find(Boolean) || e.title, entry: e }));
  const noted = entries.flatMap((e) =>
    e.kind === 'insight'
      ? []
      : e.insights.filter(Boolean).map((text, i) => ({ key: `${e.slug}:${i}`, text, entry: e }))
  );
  return [...own, ...noted].slice(0, limit);
}

/** Ideas and lessons as handwritten notes taped to the page. */
export function IdeaNotes({ ideas }: { ideas: Idea[] }) {
  return (
    <ul className="home-notes">
      {ideas.map((idea, i) => (
        <li
          key={idea.key}
          className={`pp-note home-note${i % 3 === 1 ? ' home-note-yellow' : ''}`}
          style={{ transform: `rotate(${tilt(idea.key, 2.4).toFixed(2)}deg)` }}
        >
          <p>{idea.text}</p>
          <Link href={passportPath(idea.entry)} className="pp-label mt-3 block hover:underline">
            — {idea.entry.kind === 'insight' ? 'an idea' : idea.entry.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── Films ─────────────────────────────────────────────────────────── */

interface Film {
  key: string;
  id: string;
  entry: PassportEntry;
}

export function collectFilms(entries: PassportEntry[], limit = 6): Film[] {
  const films = entries.flatMap((e) =>
    e.videos.flatMap((v, i) => {
      const id = youtubeId(v);
      return id ? [{ key: `${e.slug}:${i}`, id, entry: e }] : [];
    })
  );
  // Film entries lead; videos attached to treks and trips follow.
  return films.sort((a, b) => Number(b.entry.kind === 'video') - Number(a.entry.kind === 'video')).slice(0, limit);
}

/** Films on a strip of negative, sprocket holes and frame numbers included. */
export function FilmStrip({ films }: { films: Film[] }) {
  return (
    <div className="home-film" role="list">
      {films.map((film, i) => (
        <Link key={film.key} href={passportPath(film.entry)} className="home-frame" role="listitem">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${film.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="home-frame-play" aria-hidden="true" />
          <span className="home-frame-title">{film.entry.title}</span>
          <span className="home-frame-no" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}A
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ── Next up ───────────────────────────────────────────────────────── */

/** Dreams as a split-flap departures board. */
export function Departures({ dreams }: { dreams: PassportEntry[] }) {
  return (
    <div className="home-board" role="table" aria-label="Next up">
      <div className="home-board-row home-board-head" role="row">
        <span role="columnheader">When</span>
        <span role="columnheader">Destination</span>
        <span role="columnheader" className="home-board-kind">
          Kind
        </span>
        <span role="columnheader">Status</span>
      </div>
      {dreams.map((d) => (
        <Link key={d.slug} href={passportPath(d)} className="home-board-row" role="row">
          <span role="cell">{(d.target || 'Someday').slice(0, 14)}</span>
          <span role="cell" className="home-board-dest">
            {d.title}
            {d.place && <small> · {d.place}</small>}
          </span>
          <span role="cell" className="home-board-kind">
            {kindMeta(d.kind).label}
          </span>
          <span role="cell" className="home-board-status" data-blink={hashString(d.slug) % 3 === 0 || undefined}>
            Planned
          </span>
        </Link>
      ))}
    </div>
  );
}
