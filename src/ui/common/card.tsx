import Link from 'next/link';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export function Card({ children, className = '', href }: CardProps) {
  const baseClasses =
    'rounded-sm border border-border bg-background p-6 shadow-paper transition-all hover:shadow-paper-lg hover:border-primary';
  const classes = className ? `${baseClasses} ${className}` : baseClasses;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
