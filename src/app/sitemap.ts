import type { MetadataRoute } from 'next';
import { contentRepository } from '@/adapters/content';
import { passportPath } from '@/domain/types/passport';
import { getPublicPassport } from '@/lib/passport/get-passport';
import { postPath } from '@/domain/types';
import { absoluteUrl } from '@/lib/config';

/**
 * The home page, the passport and the entries themselves. Index, folder and tag pages are
 * left out on purpose: an entry is reached by its own link, not by browsing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await contentRepository.getAllPosts();
  const { entries } = await getPublicPassport();

  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    { url: absoluteUrl('/passport'), changeFrequency: 'weekly', priority: 0.9 },
    ...entries.map((entry) => ({
      url: absoluteUrl(passportPath(entry)),
      lastModified: new Date(entry.updatedAt || entry.createdAt || Date.now()),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(postPath(post)),
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
