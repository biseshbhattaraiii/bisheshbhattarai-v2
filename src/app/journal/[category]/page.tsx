import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { contentRepository } from '@/adapters/content';
import { BackLink, Container, JsonLd } from '@/ui/common';
import { EntryList, FolderNav } from '@/ui/journal';
import { categories, getCategory } from '@/lib/categories';
import {
  buildMetadata,
  breadcrumbSchema,
  collectionSchema,
  graph,
} from '@/lib/seo';

interface FolderPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const { category } = await params;
  const folder = getCategory(category);

  if (!folder) {
    return buildMetadata({
      title: 'Not found',
      description: 'That folder does not exist.',
      path: `/journal/${category}`,
      noIndex: true,
    });
  }

  const posts = await contentRepository.getPostsByCategory(folder.slug);

  return buildMetadata({
    title: folder.label,
    description: folder.description,
    path: `/journal/${folder.slug}`,
    // An empty folder has nothing to rank for; keep it out of the index
    // but leave the links crawlable.
    noIndex: posts.length === 0,
  });
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { category } = await params;
  const folder = getCategory(category);

  if (!folder) {
    notFound();
  }

  const [posts, counts, tags] = await Promise.all([
    contentRepository.getPostsByCategory(folder.slug),
    contentRepository.getCategoryCounts(),
    contentRepository.getTagsForCategory(folder.slug),
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
              <li className="text-foreground">{folder.label}</li>
            </ol>
          </nav>

          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {folder.label}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-secondary">
            {folder.intro}
          </p>
        </Container>
      </section>

      <Container className="py-step-2">
        <FolderNav counts={counts} active={folder.slug} showEmpty />

        <div className="mt-step-2">
          <EntryList
            posts={posts}
            tags={tags}
            showCategory={false}
            emptyMessage="Nothing filed here yet. The first entry is on its way."
          />
        </div>
      </Container>

      <JsonLd
        data={graph(
          collectionSchema({
            name: folder.label,
            description: folder.description,
            path: `/journal/${folder.slug}`,
            posts,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Journal', path: '/journal' },
            { name: folder.label, path: `/journal/${folder.slug}` },
          ])
        )}
      />
    </>
  );
}
