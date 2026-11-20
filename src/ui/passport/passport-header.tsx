'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/ui/common';

const tabs = [
  { href: '/passport', label: 'Passport' },
  { href: '/passport/wall', label: 'Memory wall' },
];

function Emblem() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="h-9 w-9 shrink-0" style={{ color: 'var(--pp-foil)' }}>
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="currentColor" strokeWidth=".8" />
      <circle cx="20" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="20" cy="20" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M11 20 H29 M12.5 15.5 H27.5 M12.5 24.5 H27.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** The cover band: foil wordmark, tabs, theme switch, a way home. */
export function PassportHeader({ ownerName }: { ownerName: string }) {
  const pathname = usePathname();

  return (
    <header className="pp-cover">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8 lg:px-12">
        <Link href="/passport" className="mr-auto flex items-center gap-2.5">
          <Emblem />
          <span>
            <b
              className="pp-display block text-[19px] font-extrabold leading-none tracking-[0.22em]"
              style={{ color: 'var(--pp-foil)' }}
            >
              Passport
            </b>
            <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.18em] opacity-70">
              {ownerName}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Passport">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="pp-tab"
              aria-current={pathname === tab.href ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          ))}
          <Link href="/" className="pp-tab">
            Home
          </Link>
        </nav>
        <div className="[&_button]:text-[color:var(--pp-cover-ink)]">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
