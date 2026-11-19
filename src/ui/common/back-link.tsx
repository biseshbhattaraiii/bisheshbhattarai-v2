'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

interface BackLinkProps {
  /** Where to go when there is no history to step back through. */
  href: string;
  /** Label for the fallback destination, e.g. "Journal". */
  label: string;
  className?: string;
}

/**
 * Back control.
 *
 * Rendered as a real link so crawlers and no-JS readers get a genuine
 * destination, but a click steps back through history when the reader
 * actually arrived from somewhere on this site.
 */
export function BackLink({ href, label, className = '' }: BackLinkProps) {
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle modified clicks (new tab, download, etc.).
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const sameSiteReferrer =
      typeof document !== 'undefined' &&
      document.referrer !== '' &&
      new URL(document.referrer).origin === window.location.origin;

    if (sameSiteReferrer && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 text-sm text-secondary hover:text-accent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden="true">←</span>
      <span>{`Back to ${label}`}</span>
    </Link>
  );
}
