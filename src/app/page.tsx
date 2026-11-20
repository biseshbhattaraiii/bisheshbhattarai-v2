import type { Metadata } from 'next';
import { JsonLd } from '@/ui/common';
import { siteConfig } from '@/lib/config';
import { buildMetadata, graph, breadcrumbSchema } from '@/lib/seo';
import { getDiary } from '@/lib/diary';
import { DiaryPage } from '@/ui/diary/diary-page';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
});

/**
 * The landing page is the diary: one markdown file, `content/diary.md`,
 * shown the way it reads in an editor.
 */
export default async function HomePage() {
  const diary = await getDiary();

  return (
    <>
      <DiaryPage diary={diary} author={siteConfig.author.name} />
      <JsonLd data={graph(breadcrumbSchema([{ name: 'Home', path: '/' }]))} />
    </>
  );
}
