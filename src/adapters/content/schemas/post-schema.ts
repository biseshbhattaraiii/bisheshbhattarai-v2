import { z } from 'zod';

export const postCategorySchema = z.enum([
  'life',
  'coding',
  'travel',
  'fitness',
]);

export const postFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  category: postCategorySchema,
  tags: z.array(z.string()),
  published: z.boolean().default(true),
  coverImage: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
