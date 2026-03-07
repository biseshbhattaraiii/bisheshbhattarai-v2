export type PostCategory = 'life' | 'coding' | 'travel' | 'fitness';

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: PostCategory;
  tags: string[];
  published: boolean;
  coverImage?: string;
  readingTime?: number;
}
