import Link from 'next/link';
import { format } from 'date-fns';
import type { Post } from '@/domain/types';
import { postPath } from '@/domain/types';
import { categoryLabel } from '@/lib/categories';

interface RelatedEntriesProps {
  posts: Post[];
}

export function RelatedEntries({ posts }: RelatedEntriesProps) {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="mt-step-2 border-t border-border pt-step"
    >
      <h2 id="related-heading" className="label mb-4">
        Read next
      </h2>
      <ul className="grid gap-5 sm:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={postPath(post)} className="card card-hover block p-5">
              <span className="text-xs text-accent">
                {categoryLabel(post.category)}
              </span>
              <p className="mt-2 font-display text-lg font-semibold leading-snug">
                {post.title}
              </p>
              <time
                dateTime={post.date}
                className="mt-2 block text-xs text-secondary"
              >
                {format(new Date(post.date), 'MMM yyyy')}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
