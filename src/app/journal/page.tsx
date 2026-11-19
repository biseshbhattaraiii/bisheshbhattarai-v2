import type { Metadata } from 'next';
import { contentRepository } from '@/adapters/content';
import { BackLink, Container, JsonLd } from '@/ui/common';
import { EntryList, FolderNav, TagCloud } from '@/ui/journal';
import { siteConfig } from '@/lib/config';
import {
  buildMetadata,
  blogSchema,
  breadcrumbSchema,
  collectionSchema,
  graph,
} from '@/lib/seo';

const TITLE = 'Journal';
const DESCRIPTION =
  'Everything I write, in one place: building SaaS in public, running the agency, engineering notes and the lessons in between.';

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/journal',
});

export default async function JournalPage() {
  const [posts, counts, tags] = await Promise.all([
    contentRepository.getAllPosts(),
    contentRepository.getCategoryCounts(),
    contentRepository.getAllTags(),
  ]);

  return (
    <>
      <section className="border-b border-border">
        <Container className="py-step-3">
          <BackLink href="/" label="home" />
          <p className="label mt-6">Journal</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Everything, newest first.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-secondary">{DESCRIPTION}</p>
        </Container>
      </section>

      <Container className="py-step-2">
        <FolderNav counts={counts} active="all" showEmpty />

        <div className="mt-step-2">
          <EntryList
            posts={posts}
            tags={tags}
            emptyMessage="Nothing published yet. The first entry is on its way."
          />
        </div>

        {tags.length > 0 && (
          <section className="mt-step-2 border-t border-border pt-step">
            <h2 className="label mb-4">All tags</h2>
            <TagCloud tags={tags} />
          </section>
        )}
      </Container>

      <JsonLd
        data={graph(
          blogSchema({
            name: `${TITLE} · ${siteConfig.name}`,
            description: DESCRIPTION,
            path: '/journal',
          }),
          collectionSchema({
            name: `${TITLE} · ${siteConfig.name}`,
            description: DESCRIPTION,
            path: '/journal',
            posts,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Journal', path: '/journal' },
          ])
        )}
      />
    </>
  );
}
