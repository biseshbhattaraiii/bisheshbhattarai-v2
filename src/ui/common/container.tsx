import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  const baseClasses = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
  const classes = className ? `${baseClasses} ${className}` : baseClasses;

  return <div className={classes}>{children}</div>;
}
