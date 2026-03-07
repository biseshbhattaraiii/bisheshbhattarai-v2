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
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-primary text-background hover:bg-accent',
    secondary: 'bg-secondary text-foreground hover:bg-muted',
    ghost: 'text-foreground hover:bg-muted',
  };

  const classes = className
    ? `${baseClasses} ${variantClasses[variant]} ${className}`
    : `${baseClasses} ${variantClasses[variant]}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
