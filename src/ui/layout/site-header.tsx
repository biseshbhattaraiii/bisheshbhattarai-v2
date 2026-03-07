import Link from 'next/link';
import { Container } from '@/ui/common';
import { Navigation } from './navigation';
import { siteConfig } from '@/lib/config';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur shadow-paper">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold font-display hover:text-primary transition-colors">
          {siteConfig.name}
        </Link>
        <Navigation />
      </Container>
    </header>
  );
}
