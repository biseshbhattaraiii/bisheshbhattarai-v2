import { format } from 'date-fns';
import { contentRepository } from '@/adapters/content';
import { siteConfig } from '@/lib/config';
import { categoryLabel } from '@/lib/categories';
import { renderOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'Journal entry';
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  const posts = await contentRepository.getAllPosts();
  return posts.map((post) => ({ category: post.category, slug: post.slug }));
}

export default async function OgImage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const post = await contentRepository.getPostBySlug(params.slug);

  if (!post) {
    return renderOgImage({
      eyebrow: 'Journal',
      title: 'Entry not found',
      footer: siteConfig.author.name,
    });
  }

  return renderOgImage({
    eyebrow: categoryLabel(post.category),
    title: post.title,
    subtitle: post.description,
    footer: siteConfig.author.name,
    note: `${format(new Date(post.date), 'MMM yyyy')}${
      post.readingTime ? ` · ${post.readingTime} min` : ''
    }`,
  });
}
