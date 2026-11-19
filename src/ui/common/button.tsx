import Link from 'next/link';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onClick?: () => void;
}

export function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium';

  const variants = {
    primary: 'border-accent bg-accent text-white hover:bg-accent/90',
    secondary:
      'border-border bg-surface text-foreground hover:border-accent/40 hover:text-accent',
    ghost: 'border-transparent text-secondary hover:text-accent',
  } as const;

  const classes = [base, variants[variant], className]
    .filter(Boolean)
    .join(' ');

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:');
    if (external) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
