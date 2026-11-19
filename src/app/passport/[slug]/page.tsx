import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { passportPath } from '@/domain/types/passport';
import { buildMetadata } from '@/lib/seo';
import { kindMeta } from '@/lib/passport/kinds';
import { getPublicEntry, getPublicPassport } from '@/lib/passport/get-passport';
import {
  DaysSection,
  ElevationSection,
  EntryFacts,
  EntryHero,
  GalleryProvider,
  InsightsSection,
  PhotosSection,
  StorySection,
  VideosSection,
} from '@/ui/passport';

export const revalidate = 3600;

interface EntryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { entries } = await getPublicPassport();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const entry = await getPublicEntry((await params).slug);
  if (!entry) return { title: 'Not found' };
  const cover = entry.cover || entry.photos[0]?.url;
  return {
    ...buildMetadata({
      title: entry.title,
      description: entry.summary || `${kindMeta(entry.kind).label}: ${entry.title}`,
      path: passportPath(entry),
      type: 'article',
      publishedTime: entry.startDate || undefined,
    }),
    ...(cover?.startsWith('http') ? { openGraph: { images: [{ url: cover }] } } : {}),
  };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const entry = await getPublicEntry((await params).slug);
  if (!entry) notFound();

  return (
    <GalleryProvider photos={entry.photos}>
      <article className="grid gap-10">
        <EntryHero entry={entry} />
        <EntryFacts entry={entry} />
        <VideosSection entry={entry} />
        <StorySection story={entry.story} />
        <ElevationSection entry={entry} />
        <DaysSection entry={entry} />
        <InsightsSection entry={entry} />
        <PhotosSection entry={entry} />
      </article>
    </GalleryProvider>
  );
}
