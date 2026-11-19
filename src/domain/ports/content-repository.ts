import type { Post } from '../types/post';
import type { Tag } from '../types/tag';

export interface CategoryCount {
  category: string;
  count: number;
}

/** Neighbours in reading order. */
export interface PostNeighbours {
  previous: Post | null;
  next: Post | null;
}

export interface ContentRepository {
  getAllPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getFeaturedPost(): Promise<Post | null>;
  getPostsByCategory(category: string): Promise<Post[]>;
  getPostsByTag(tag: string): Promise<Post[]>;
  getAllTags(): Promise<Tag[]>;
  getTagsForCategory(category: string): Promise<Tag[]>;
  getCategoryCounts(): Promise<CategoryCount[]>;
  getRelatedPosts(slug: string, limit?: number): Promise<Post[]>;
  getPostNeighbours(slug: string): Promise<PostNeighbours>;
}
