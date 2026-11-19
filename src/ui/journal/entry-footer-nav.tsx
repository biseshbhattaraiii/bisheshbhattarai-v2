import Link from 'next/link';
import type { PostNeighbours } from '@/domain/ports';
import { postPath } from '@/domain/types';

/** Older and newer entries. */
export function EntryFooterNav({ previous, next }: PostNeighbours) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="More entries"
      className="mt-step-2 grid gap-6 border-t border-border pt-step sm:grid-cols-2"
    >
      {next ? (
        <Link href={postPath(next)} className="group">
          <span className="label">← Earlier</span>
          <p className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-accent">
            {next.title}
          </p>
        </Link>
      ) : (
        <span />
      )}

      {previous && (
        <Link href={postPath(previous)} className="group sm:text-right">
          <span className="label">Later →</span>
          <p className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-accent">
            {previous.title}
          </p>
        </Link>
      )}
    </nav>
  );
}
