import type { ReactNode } from 'react';

type Size = 'page' | 'content' | 'prose';

interface ContainerProps {
  children: ReactNode;
  /**
   * page    — full-width layout (grids, headers, footers)
   * content — wide editorial column
   * prose   — reading measure, ~70 characters
   */
  size?: Size;
  className?: string;
}

const sizes: Record<Size, string> = {
  page: 'max-w-page',
  content: 'max-w-content',
  prose: 'max-w-prose',
};

export function Container({
  children,
  size = 'page',
  className = '',
}: ContainerProps) {
  return (
    <div
      className={['mx-auto w-full px-5 sm:px-8 lg:px-12', sizes[size], className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
