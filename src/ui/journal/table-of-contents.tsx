import type { TocEntry } from '@/lib/toc';

interface TableOfContentsProps {
  entries: TocEntry[];
}

/** Contents for a long entry. Hidden when there's little to jump between. */
export function TableOfContents({ entries }: TableOfContentsProps) {
  if (entries.length < 3) return null;

  return (
    <nav
      aria-labelledby="toc-heading"
      className="my-step rounded-lg border border-border bg-muted/50 p-5"
    >
      <h2 id="toc-heading" className="label mb-3">
        In this entry
      </h2>
      <ol className="space-y-1.5 text-[0.95rem]">
        {entries.map((entry, i) => (
          <li
            key={`${entry.id}-${i}`}
            className={entry.level === 3 ? 'pl-5' : ''}
          >
            <a href={`#${entry.id}`} className="text-secondary hover:text-accent">
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
