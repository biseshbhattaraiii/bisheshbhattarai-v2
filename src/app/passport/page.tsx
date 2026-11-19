import type { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import { buildMetadata } from '@/lib/seo';
import { getPublicPassport } from '@/lib/passport/get-passport';
import { HolderCard, Section, Stamp, StampShelf, StampSlot } from '@/ui/passport';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Passport',
  description: `Treks, travels, ideas, hobbies and films: every one a stamp in ${siteConfig.author.name}'s passport.`,
  path: '/passport',
});

function EmptyShelf() {
  return (
    <div className="pp-empty">
      <Stamp
        flat
        className="w-[170px]"
        entry={{
          slug: 'first',
          kind: 'trek',
          status: 'dream',
          title: 'Your first stamp',
          place: 'Anywhere',
          startDate: '',
          endDate: '',
          target: 'Ready when you are',
          stamp: { shape: 'circle', ink: 'green' },
          days: [],
          maxAltitudeM: null,
        }}
      />
      <h2 className="pp-display text-3xl font-black">No stamps yet</h2>
      <p className="pp-muted m-0 max-w-[46ch]">
        Every trek, trip, idea, hobby and film added from the back office gets its own stamp here.
      </p>
    </div>
  );
}

export default async function PassportPage() {
  const { holder, entries } = await getPublicPassport();
  const done = entries.filter((e) => e.status === 'done');
  const dreams = entries.filter((e) => e.status === 'dream');

  return (
    <div className="grid gap-10">
      <HolderCard holder={holder} entries={entries} fallbackName={siteConfig.author.name} />

      <Section title="Entries" note={`${done.length} ${done.length === 1 ? 'stamp' : 'stamps'} · open one to read its pages`}>
        {done.length ? <StampShelf entries={done} /> : <EmptyShelf />}
      </Section>

      {dreams.length > 0 && (
        <Section title="Visas pending" note="Still calling">
          <div className="pp-stampgrid">
            {dreams.map((entry) => (
              <StampSlot key={entry.slug} entry={entry} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
