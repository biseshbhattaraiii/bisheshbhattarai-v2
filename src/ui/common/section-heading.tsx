import type { ReactNode } from 'react';

interface SectionHeadingProps {
  /** Small uppercase label above the heading. */
  eyebrow?: string;
  children: ReactNode;
  /** Optional supporting line under the heading. */
  lede?: ReactNode;
  as?: 'h2' | 'h3';
  id?: string;
}

export function SectionHeading({
  eyebrow,
  children,
  lede,
  as: Tag = 'h2',
  id,
}: SectionHeadingProps) {
  return (
    <div className="mb-step" id={id}>
      {eyebrow && <p className="label mb-2">{eyebrow}</p>}
      <Tag className="font-display text-3xl font-semibold tracking-tight md:text-[2.1rem]">
        {children}
      </Tag>
      {lede && (
        <p className="mt-3 max-w-prose text-lg text-secondary">{lede}</p>
      )}
    </div>
  );
}
