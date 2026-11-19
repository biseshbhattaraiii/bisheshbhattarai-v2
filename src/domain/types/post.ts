/** Folders. Every post lives in exactly one. */
export type PostCategory =
  | 'build-in-public'
  | 'agency'
  | 'engineering'
  | 'lessons';

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  /** Last meaningful revision — used for SEO freshness signals. */
  updated?: string;
  category: PostCategory;
  tags: string[];
  published: boolean;
  featured?: boolean;
  coverImage?: string;
  /** YouTube video id, embedded at the top of the entry. */
  video?: string;
  readingTime?: number;
  wordCount?: number;
}

/** Canonical path for an entry: /journal/<folder>/<slug>. */
export function postPath(post: Pick<Post, 'category' | 'slug'>): string {
  return `/journal/${post.category}/${post.slug}`;
}
