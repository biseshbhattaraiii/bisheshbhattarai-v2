import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Back office',
  robots: { index: false, follow: false, nocache: true },
};

/** Everything under /admin is private, uncached and unindexed. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-page px-5 sm:px-8 lg:px-12">
      {children}
    </div>
  );
}
