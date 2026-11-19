import { slugify } from './slug';

export interface TocEntry {
  id: string;
  title: string;
  level: 2 | 3;
}

/**
 * Pulls the contents page out of raw MDX.
 *
 * Fenced code is stripped first so a `# comment` inside a shell block
 * never turns up in the table of contents.
 */
export function extractToc(source: string): TocEntry[] {
  const withoutCode = source.replace(/```[\s\S]*?```/g, '');
  const headings = withoutCode.matchAll(/^(#{2,3})\s+(.+?)\s*#*\s*$/gm);

  return [...headings].map((match) => {
    const title = (match[2] ?? '').replace(/[*_`]/g, '').trim();
    return {
      id: slugify(title),
      title,
      level: (match[1] ?? '##').length as 2 | 3,
    };
  });
}
