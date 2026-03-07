import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  variant?: 'default' | 'primary';
}

export function Tag({ children, variant = 'default' }: TagProps) {
  const baseClasses = 'inline-block rounded-full px-3 py-1 text-sm';

  const variantClasses = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary text-background',
  };

  const classes = `${baseClasses} ${variantClasses[variant]}`;

  return <span className={classes}>{children}</span>;
}
