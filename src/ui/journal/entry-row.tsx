import Link from 'next/link';
import { format } from 'date-fns';
import type { Post } from '@/domain/types';
import { postPath } from '@/domain/types';
import { tagSlug } from '@/lib/slug';
import { categoryLabel } from '@/lib/categories';

interface EntryRowProps {
  post: Post;
  /** Hide the folder when the whole list is already one folder. */
  showCategory?: boolean;
}

/** One entry in a list. */
export function EntryRow({ post, showCategory = true }: EntryRowProps) {
  return (
    <article className="group border-b border-border py-7">
      <div className="grid gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10">
        <div className="flex flex-wrap items-center gap-x-3 text-sm text-secondary">
          <time dateTime={post.date}>
            {format(new Date(post.date), 'd MMM yyyy')}
          </time>
          {showCategory && (
            <Link
              href={`/journal/${post.category}`}
              className="text-accent hover:underline"
            >
              {categoryLabel(post.category)}
            </Link>
          )}
        </div>

        <div className="max-w-prose">
          <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight">
            <Link href={postPath(post)} className="group-hover:text-accent">
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 text-secondary">{post.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
            {post.readingTime && <span>{post.readingTime} min read</span>}
            {post.tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/journal/tag/${tagSlug(tag)}`}
                className="hover:text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
