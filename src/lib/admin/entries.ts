import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export interface EntrySummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  published: boolean;
}

/**
 * Every entry on disk, drafts included.
 *
 * The public repository hides unpublished posts; the back office has to
 * see them, so it reads the directory directly.
 */
export async function listAllEntries(): Promise<EntrySummary[]> {
  let filenames: string[] = [];
  try {
    filenames = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith('.mdx'));
  } catch {
    return [];
  }

  const entries = await Promise.all(
    filenames.map(async (filename) => {
      const file = await fs.readFile(path.join(POSTS_DIR, filename), 'utf-8');
      const { data } = matter(file);
      return {
        slug: filename.replace(/\.mdx$/, ''),
        title: String(data.title ?? filename),
        date: String(data.date ?? ''),
        category: String(data.category ?? ''),
        published: data.published !== false,
      };
    })
  );

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}
