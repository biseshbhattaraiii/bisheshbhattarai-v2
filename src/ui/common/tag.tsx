import Link from 'next/link';
import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  href?: string;
  variant?: 'default' | 'accent';
}

export function Tag({ children, href, variant = 'default' }: TagProps) {
  const classes = [
    'inline-block rounded-full border px-3 py-1 text-xs',
    variant === 'accent'
      ? 'border-accent/40 text-accent'
      : 'border-border text-secondary',
    href ? 'hover:border-accent/50 hover:text-accent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
