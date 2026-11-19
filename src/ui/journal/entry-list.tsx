'use client';

import { useState } from 'react';
import type { Post, Tag } from '@/domain/types';
import { tagSlug } from '@/lib/slug';
import { EntryRow } from './entry-row';

interface EntryListProps {
  posts: Post[];
  tags: Tag[];
  showCategory?: boolean;
  /** Message shown when a filter matches nothing. */
  emptyMessage?: string;
}

/**
 * A list of entries with a tag filter.
 *
 * Every post is rendered on the server, so crawlers and no-JS readers get
 * the full list; the filter only hides rows client-side. Each tag also has
 * its own indexable page, linked from the rows themselves.
 */
export function EntryList({
  posts,
  tags,
  showCategory = true,
  emptyMessage = 'Nothing here yet.',
}: EntryListProps) {
  const [active, setActive] = useState<string | null>(null);

  const visible = active
    ? posts.filter((post) => post.tags.some((t) => tagSlug(t) === active))
    : posts;

  const chip = 'rounded-full border px-3 py-1 text-sm whitespace-nowrap';
  const on = 'border-accent bg-accent/10 text-accent';
  const off =
    'border-border text-secondary hover:border-accent/40 hover:text-foreground';

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1">Filter</span>
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-pressed={active === null}
            className={`${chip} ${active === null ? on : off}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.slug}
              type="button"
              onClick={() =>
                setActive((current) => (current === tag.slug ? null : tag.slug))
              }
              aria-pressed={active === tag.slug}
              className={`${chip} ${active === tag.slug ? on : off}`}
            >
              #{tag.name} <span className="opacity-60">{tag.count}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="mt-step border-t border-border">
          {visible.map((post) => (
            <EntryRow
              key={post.slug}
              post={post}
              showCategory={showCategory}
            />
          ))}
        </div>
      ) : (
        <p className="mt-step text-secondary">{emptyMessage}</p>
      )}
    </div>
  );
}
