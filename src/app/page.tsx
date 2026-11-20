import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, ThemeToggle } from '@/ui/common';
import { siteConfig, socialLinks, substackUrl } from '@/lib/config';
import { buildMetadata, graph, breadcrumbSchema } from '@/lib/seo';
import { hero } from '@/lib/narrative';
import { passportFontVars } from '@/lib/passport/fonts';
import { getPublicPassport } from '@/lib/passport/get-passport';
import { passportStats } from '@/lib/passport/stats';
import { Guilloche, InkFilters } from '@/ui/passport';
import { Section } from '@/ui/passport/entry-sections';
import { HeroSeal } from '@/ui/home/hero-seal';
import { PassportSpread } from '@/ui/home/passport-spread';
import { Departures, FilmStrip, IdeaNotes, collectFilms, collectIdeas } from '@/ui/home/collections';
import '@/ui/passport/styles/tokens.css';
import '@/ui/passport/styles/passport.css';
import '@/ui/passport/styles/entry.css';
import '@/ui/home/home.css';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
});

/** The two lines at the foot of a passport's ID page, spelling out the owner. */
function mrz(name: string, stamps: number): [string, string] {
  const parts = name.toUpperCase().split(/\s+/).filter(Boolean);
  const last = parts.pop() ?? '';
  const pad = (v: string) => v.replace(/[^A-Z0-9<]/g, '<').padEnd(44, '<').slice(0, 44);
  return [
    pad(`P<WEB${last}<<${parts.join('<')}`),
    pad(`BUILDER<INTERNET<PRODUCTS<${String(stamps).padStart(3, '0')}STAMPS`),
  ];
}

/**
 * The landing page is the passport's opening spread: who I am and where
 * the notebook lives, then everything stamped so far, the ideas worth
 * keeping, the films and what is next.
 */
export default async function HomePage() {
  const socials = socialLinks();
  const { holder, entries } = await getPublicPassport();
  const name = holder.name || siteConfig.author.name;

  const done = entries.filter((e) => e.status === 'done');
  const dreams = entries.filter((e) => e.status === 'dream');
  const stats = passportStats(entries);
  const ideas = collectIdeas(entries);
  const films = collectFilms(done);
  const [mrz1, mrz2] = mrz(name, stats.stamps);

  return (
    <div className={`pp home ${passportFontVars} relative min-h-screen overflow-x-clip`}>
      <Guilloche />
      <InkFilters />

      <div className="relative z-[1] mx-auto w-full max-w-page px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between py-4">
          <span className="pp-label">Passport · {name}</span>
          <ThemeToggle />
        </div>

        {/* ── The line, the notebook ─────────────────────────────── */}
        <section className="home-hero">
          <div className="min-w-0">
            <h1 className="home-headline pp-display">
              {hero.headline}
              <svg className="home-underline" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9 C 60 3, 120 12, 180 6 S 270 4, 297 8" />
              </svg>
            </h1>

            <p className="home-lede">
              Read my notebook at{' '}
              <a href={substackUrl} rel="noreferrer" className="home-link">
                bishes.substack.com
              </a>
            </p>

            <div className="mt-6">
              <a href={substackUrl} rel="noreferrer" className="home-cta">
                Subscribe on Substack
              </a>
            </div>

            <p className="home-passport-line">
              Treks, trips, hobbies and the lessons in between are stamped in{' '}
              <Link href="/passport" className="home-link">
                my passport
              </Link>
              .
            </p>
          </div>

          <HeroSeal name={name} stamps={stats.stamps} className="home-seal" />
        </section>

        {/* ── Everything stamped ─────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-1 gap-16 pb-10">
          <Section
            title="Stamped so far"
            note={`${stats.byKind.trek} treks · ${stats.byKind.travel} travels · ${stats.byKind.insight} ideas · ${stats.byKind.hobby} hobbies · ${stats.byKind.video} films`}
          >
            <PassportSpread entries={done} total={stats.stamps} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/passport" className="pp-btn">
                Open the passport →
              </Link>
              <Link href="/passport/wall" className="pp-btn">
                Memory wall
              </Link>
            </div>
          </Section>

          {ideas.length > 0 && (
            <Section title="Ideas & lessons" note="Written down so they stick">
              <IdeaNotes ideas={ideas} />
            </Section>
          )}

          {films.length > 0 && (
            <Section title="On film" note="Press play">
              <FilmStrip films={films} />
            </Section>
          )}

          {dreams.length > 0 && (
            <Section title="Next up" note="Visas pending">
              <Departures dreams={dreams.slice(0, 6)} />
            </Section>
          )}
        </div>

        {/* ── Ways to reach me ───────────────────────────────────── */}
        <footer className="home-foot">
          {socials.length > 0 && (
            <ul className="home-socials">
              {socials.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="me noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p>
            <a href={`mailto:${siteConfig.author.email}`} className="home-link">
              {siteConfig.author.email}
            </a>
          </p>
          <div className="pp-mrz mt-8" aria-hidden="true">
            {mrz1}
            {'\n'}
            {mrz2}
          </div>
        </footer>
      </div>

      <JsonLd data={graph(breadcrumbSchema([{ name: 'Home', path: '/' }]))} />
    </div>
  );
}
