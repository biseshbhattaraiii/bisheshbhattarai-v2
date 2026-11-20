import type { Metadata } from 'next';
import { JsonLd } from '@/ui/common';
import { siteConfig } from '@/lib/config';
import { buildMetadata, graph, breadcrumbSchema } from '@/lib/seo';
import { getDiary } from '@/lib/diary';
import { DiaryPage } from '@/ui/diary/diary-page';
import { DiaryPassport } from '@/ui/diary/diary-passport';
import { getPublicPassport } from '@/lib/passport/get-passport';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
});

/**
 * The landing page is the diary: one markdown file, `content/diary.md`,
 * shown the way it reads in an editor, with the passport and travel log
 * written in where the file says `{{passport}}`.
 */
export default async function HomePage() {
  const [diary, { entries }] = await Promise.all([getDiary(), getPublicPassport()]);

  return (
    <>
      <DiaryPage
        diary={diary}
        author={siteConfig.author.name}
        slots={{ passport: <DiaryPassport entries={entries} /> }}
      />
      <JsonLd data={graph(breadcrumbSchema([{ name: 'Home', path: '/' }]))} />
    </>
  );
}
