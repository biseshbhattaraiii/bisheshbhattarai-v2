import { z } from 'zod';

export const projectFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(999),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
