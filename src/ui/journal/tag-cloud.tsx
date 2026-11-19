import Link from 'next/link';
import type { Tag } from '@/domain/types';

interface TagCloudProps {
  tags: Tag[];
  limit?: number;
  activeSlug?: string;
}

export function TagCloud({ tags, limit = 40, activeSlug }: TagCloudProps) {
  const shown = tags.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {shown.map((tag) => {
        const isActive = tag.slug === activeSlug;
        return (
          <Link
            key={tag.slug}
            href={`/journal/tag/${tag.slug}`}
            aria-current={isActive ? 'page' : undefined}
            className={`text-sm ${
              isActive
                ? 'text-accent underline underline-offset-4'
                : 'text-secondary hover:text-accent'
            }`}
          >
            #{tag.name}
            <span className="ml-1 opacity-60">{tag.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
