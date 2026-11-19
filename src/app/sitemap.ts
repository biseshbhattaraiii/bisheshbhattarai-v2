import type { MetadataRoute } from 'next';
import { contentRepository } from '@/adapters/content';
import { postPath } from '@/domain/types';
import { absoluteUrl } from '@/lib/config';

/**
 * The home page and the entries themselves. Index, folder and tag pages are
 * left out on purpose: an entry is reached by its own link, not by browsing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await contentRepository.getAllPosts();

  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(postPath(post)),
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
