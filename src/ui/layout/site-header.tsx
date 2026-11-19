import Link from 'next/link';
import { Navigation } from './navigation';
import { Container, ThemeToggle } from '@/ui/common';
import { siteConfig } from '@/lib/config';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <Container className="relative flex h-14 items-center justify-between gap-3 md:h-16 md:gap-6">
        <Link
          href="/"
          className="min-w-0 truncate font-display text-base font-semibold tracking-tight hover:text-accent md:text-lg"
        >
          {siteConfig.name}
        </Link>

        <div className="flex shrink-0 items-center gap-2 md:gap-6">
          <Navigation />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
