import Link from 'next/link';
import type { ReactNode } from 'react';
import { slugify } from '@/lib/slug';
import { YouTube } from '@/ui/common';

/** Flattens MDX children back to plain text so a heading can slug itself. */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join('');
  }
  if (typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

function heading(Level: 'h2' | 'h3') {
  return function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(textOf(children));
    return (
      <Level id={id}>
        {children}
        <a
          href={`#${id}`}
          className="anchor no-underline"
          aria-label={`Link to this section`}
        >
          §
        </a>
      </Level>
    );
  };
}

/**
 * MDX renderers.
 *
 * Headings get stable anchors (matched by the table of contents), and
 * internal links go through next/link so the notebook doesn't reload
 * when you flip a page.
 */
export const mdxComponents = {
  h2: heading('h2'),
  h3: heading('h3'),
  // Usage in MDX: <YouTube id="dQw4w9WgXcQ" title="Week 12 build log" />
  YouTube,
  a: ({ href = '', children }: { href?: string; children?: ReactNode }) => {
    const isInternal = href.startsWith('/');
    const isAnchor = href.startsWith('#');

    if (isInternal) {
      return <Link href={href}>{children}</Link>;
    }
    if (isAnchor) {
      return <a href={href}>{children}</a>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};
