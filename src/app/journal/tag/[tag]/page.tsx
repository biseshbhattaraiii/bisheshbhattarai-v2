import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { contentRepository } from '@/adapters/content';
import { BackLink, Container, JsonLd } from '@/ui/common';
import { EntryRow, TagCloud } from '@/ui/journal';
import {
  buildMetadata,
  breadcrumbSchema,
  collectionSchema,
  graph,
} from '@/lib/seo';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await contentRepository.getAllTags();
  return tags.map((tag) => ({ tag: tag.slug }));
}

export const dynamicParams = false;

async function findTag(slug: string) {
  const tags = await contentRepository.getAllTags();
  return tags.find((t) => t.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = await findTag(slug);

  if (!tag) {
    return buildMetadata({
      title: 'Not found',
      description: 'No entries filed under that topic.',
      path: `/journal/tag/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `#${tag.name} · Journal`,
    description: `Everything filed under “${tag.name}”: ${tag.count} ${
      tag.count === 1 ? 'entry' : 'entries'
    }.`,
    path: `/journal/tag/${tag.slug}`,
    // Thin one-post topic pages compete with the post itself.
    noIndex: tag.count < 2,
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: slug } = await params;
  const tag = await findTag(slug);

  if (!tag) {
    notFound();
  }

  const [posts, allTags] = await Promise.all([
    contentRepository.getPostsByTag(tag.slug),
    contentRepository.getAllTags(),
  ]);

  return (
    <>
      <section className="border-b border-border">
        <Container className="py-step-2">
          <BackLink href="/journal" label="the journal" />

          <nav aria-label="Breadcrumb" className="mt-6">
            <ol className="flex items-center gap-2 text-sm text-secondary">
              <li>
                <Link href="/journal" className="hover:text-accent">
                  Journal
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">#{tag.name}</li>
            </ol>
          </nav>

          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            #{tag.name}
          </h1>
          <p className="mt-3 text-secondary">
            {tag.count} {tag.count === 1 ? 'entry' : 'entries'}.
          </p>
        </Container>
      </section>

      <Container className="py-step-2">
        <div className="border-t border-border">
          {posts.map((post) => (
            <EntryRow key={post.slug} post={post} />
          ))}
        </div>

        <section className="mt-step-2 border-t border-border pt-step">
          <h2 className="label mb-4">Other topics</h2>
          <TagCloud tags={allTags} activeSlug={tag.slug} />
        </section>
      </Container>

      <JsonLd
        data={graph(
          collectionSchema({
            name: `#${tag.name} · Journal`,
            description: `Journal entries tagged ${tag.name}.`,
            path: `/journal/tag/${tag.slug}`,
            posts,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Journal', path: '/journal' },
            { name: `#${tag.name}`, path: `/journal/tag/${tag.slug}` },
          ])
        )}
      />
    </>
  );
}
