import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/ui/common';
import { substackUrl } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-step-4">
      <p className="label">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        That page isn&rsquo;t here.
      </h1>
      <p className="mt-4 max-w-lg text-lg text-secondary">
        The writing moved to Substack.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/" className="link">
          Home
        </Link>
        <a href={substackUrl} rel="noreferrer" className="link">
          bishes.substack.com
        </a>
      </div>
    </Container>
  );
}
