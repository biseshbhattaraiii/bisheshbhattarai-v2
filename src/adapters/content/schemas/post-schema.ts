import { z } from 'zod';
import { categorySlugs } from '@/lib/categories';

export const postCategorySchema = z.enum(
  categorySlugs as [string, ...string[]]
);

export const postFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  updated: z.string().optional(),
  category: postCategorySchema,
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  coverImage: z.string().optional(),
  /** YouTube video id — embedded at the top of the entry. */
  video: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
