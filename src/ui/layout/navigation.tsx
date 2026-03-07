'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/config';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {siteConfig.navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? 'text-primary font-medium'
                : 'text-foreground hover:text-primary transition-colors'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
