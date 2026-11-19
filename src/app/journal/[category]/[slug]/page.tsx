import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { format } from 'date-fns';
import { contentRepository, readPostSource } from '@/adapters/content';
import { BackLink, Container, JsonLd, Tag, YouTube } from '@/ui/common';
import { EntryFooterNav, RelatedEntries, TableOfContents } from '@/ui/journal';
import { mdxComponents } from '@/ui/journal/mdx-components';
import { ReadingSettings } from '@/ui/blog';
import { postPath } from '@/domain/types';
import { categoryLabel } from '@/lib/categories';
import { tagSlug } from '@/lib/slug';
import { extractToc } from '@/lib/toc';
import {
  blogPostingSchema,
  breadcrumbSchema,
  buildMetadata,
  graph,
} from '@/lib/seo';

interface PostPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const posts = await contentRepository.getAllPosts();
  return posts.map((post) => ({ category: post.category, slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await contentRepository.getPostBySlug(slug);

  if (!post || post.category !== category) {
    return buildMetadata({
      title: 'Entry not found',
      description: 'That page no longer exists.',
      path: `/journal/${category}/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: postPath(post),
    type: 'article',
    image: post.coverImage,
    publishedTime: new Date(post.date).toISOString(),
    modifiedTime: new Date(post.updated ?? post.date).toISOString(),
    tags: post.tags,
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { category, slug } = await params;

  const [post, source] = await Promise.all([
    contentRepository.getPostBySlug(slug),
    readPostSource(slug),
  ]);

  // The folder is part of the canonical path, so a mismatched one is a 404
  // rather than a second URL for the same entry.
  if (!post || !source || post.category !== category) {
    notFound();
  }

  const [related, neighbours] = await Promise.all([
    contentRepository.getRelatedPosts(slug),
    contentRepository.getPostNeighbours(slug),
  ]);

  const toc = extractToc(source);

  return (
    <>
      <ReadingSettings />

      <article>
        <header className="border-b border-border">
          <Container className="py-step-2">
            <BackLink
              href={`/journal/${post.category}`}
              label={categoryLabel(post.category)}
            />

            <nav aria-label="Breadcrumb" className="mt-6">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-secondary">
                <li>
                  <Link href="/journal" className="hover:text-accent">
                    Journal
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/journal/${post.category}`}
                    className="text-accent hover:underline"
                  >
                    {categoryLabel(post.category)}
                  </Link>
                </li>
              </ol>
            </nav>

            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-secondary">
              {post.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-secondary">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'd MMMM yyyy')}
              </time>
              {post.updated && post.updated !== post.date && (
                <span>
                  Updated {format(new Date(post.updated), 'd MMM yyyy')}
                </span>
              )}
              {post.readingTime && <span>{post.readingTime} min read</span>}
            </div>
          </Container>
        </header>

        <Container size="prose" className="py-step-2">
          {post.video && <YouTube id={post.video} title={post.title} />}

          <TableOfContents entries={toc} />

          <div className="entry" data-reading-content>
            <MDXRemote source={source} components={mdxComponents} />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-step-2 flex flex-wrap gap-2 border-t border-border pt-step">
              {post.tags.map((tag) => (
                <Tag key={tag} href={`/journal/tag/${tagSlug(tag)}`}>
                  #{tag}
                </Tag>
              ))}
            </div>
          )}

          <RelatedEntries posts={related} />
          <EntryFooterNav {...neighbours} />
        </Container>
      </article>

      <JsonLd
        data={graph(
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Journal', path: '/journal' },
            {
              name: categoryLabel(post.category),
              path: `/journal/${post.category}`,
            },
            { name: post.title, path: postPath(post) },
          ])
        )}
      />
    </>
  );
}
