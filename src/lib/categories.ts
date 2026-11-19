import type { PostCategory } from '@/domain/types';

/**
 * Folders.
 *
 * The site is organised into a small number of folders — each one is a
 * real, indexable URL (`/journal/<slug>`) and every post lives in exactly
 * one of them. Tags cut across folders for finer filtering.
 *
 * Adding a folder here is enough: routes, filters, the sitemap and the
 * feed all read from this list.
 */
export interface CategoryMeta {
  slug: PostCategory;
  label: string;
  /** One line, used as the folder's meta description. */
  description: string;
  /** Intro shown at the top of the folder page. */
  intro: string;
}

export const categories: CategoryMeta[] = [
  {
    slug: 'build-in-public',
    label: 'Build in Public',
    description:
      'The open log of building SaaS products: what I shipped, what it earned, what broke.',
    intro:
      'Everything about the products I am building, in the open: what I shipped this week, what it costs, what it earns, and the decisions I got wrong first.',
  },
  {
    slug: 'agency',
    label: 'Agency',
    description:
      'Running and scaling a software agency: clients, pricing, process and people.',
    intro:
      'The business behind the building: winning clients, pricing work, hiring, systems, and everything that keeps an agency running while you also ship your own products.',
  },
  {
    slug: 'engineering',
    label: 'Engineering',
    description:
      'Build notes: the tools, the trade-offs, and what broke first.',
    intro:
      'Hands-on notes from the work itself. Patterns worth keeping, tools that earned their place, and the bugs that taught me something.',
  },
  {
    slug: 'lessons',
    label: 'Lessons',
    description:
      'Things I learned the slow way: habits, mistakes, and thinking out loud.',
    intro:
      'The wider lessons: habits, mistakes worth repeating out loud, and the thinking that happens away from the screen.',
  },
];

export const categorySlugs = categories.map((c) => c.slug);

const bySlug = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string): CategoryMeta | undefined {
  return bySlug.get(slug as PostCategory);
}

export function isCategory(slug: string): slug is PostCategory {
  return bySlug.has(slug as PostCategory);
}

/** Human label with a safe fallback for content that predates a rename. */
export function categoryLabel(slug: string): string {
  return bySlug.get(slug as PostCategory)?.label ?? slug;
}
