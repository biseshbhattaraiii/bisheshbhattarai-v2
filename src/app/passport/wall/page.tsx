import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getPublicPassport } from '@/lib/passport/get-passport';
import { MemoryWall, Section } from '@/ui/passport';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Memory wall',
  description: 'Photos and lessons from every trek, trip and hobby, pinned together.',
  path: '/passport/wall',
});

export default async function WallPage() {
  const { entries } = await getPublicPassport();
  const hasPins = entries.some((e) => e.photos.length || e.insights.some(Boolean));

  return (
    <Section title="Memory wall" note="Photos and lessons from everything">
      {hasPins ? (
        <MemoryWall entries={entries} />
      ) : (
        <div className="pp-empty">
          <h2 className="pp-display text-3xl font-black">An empty wall</h2>
          <p className="pp-muted m-0 max-w-[46ch]">
            Photos and reflections from every entry land here, pinned together.
          </p>
        </div>
      )}
    </Section>
  );
}
