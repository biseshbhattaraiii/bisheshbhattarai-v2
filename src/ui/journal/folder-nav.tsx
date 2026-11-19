import Link from 'next/link';
import { categories } from '@/lib/categories';
import type { CategoryCount } from '@/domain/ports';

interface FolderNavProps {
  counts: CategoryCount[];
  /** Slug of the folder currently open, or 'all'. */
  active: string;
  /** Show folders with no posts yet, greyed out. */
  showEmpty?: boolean;
}

/**
 * The folder switcher.
 *
 * Real links to real pages rather than client-side state — each folder is
 * its own indexable URL. Empty folders are hidden by default so nothing
 * promises a page with nothing on it.
 */
export function FolderNav({
  counts,
  active,
  showEmpty = false,
}: FolderNavProps) {
  const countFor = new Map(counts.map((c) => [c.category, c.count]));
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const shown = showEmpty
    ? categories
    : categories.filter((c) => (countFor.get(c.slug) ?? 0) > 0);

  if (shown.length === 0) return null;

  const base = 'rounded-full border px-4 py-1.5 text-sm whitespace-nowrap';
  const on = 'border-accent bg-accent/10 text-accent';
  const off =
    'border-border text-secondary hover:border-accent/40 hover:text-foreground';

  return (
    <nav aria-label="Folders" className="flex flex-wrap gap-2">
      <Link
        href="/journal"
        aria-current={active === 'all' ? 'page' : undefined}
        className={`${base} ${active === 'all' ? on : off}`}
      >
        Everything <span className="opacity-60">{total}</span>
      </Link>

      {shown.map((category) => {
        const isActive = active === category.slug;
        const count = countFor.get(category.slug) ?? 0;
        return (
          <Link
            key={category.slug}
            href={`/journal/${category.slug}`}
            aria-current={isActive ? 'page' : undefined}
            className={`${base} ${isActive ? on : off}`}
          >
            {category.label} <span className="opacity-60">{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
