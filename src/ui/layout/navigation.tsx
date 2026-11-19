'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/config';

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A tap on a link changes the route but not the tree, so close it here.
  useEffect(() => setOpen(false), [pathname]);

  // While the sheet is up the page behind it should not scroll.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function isActive(href: string): boolean {
    const [path] = href.split('#');
    if (href.includes('#')) return false;
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <>
      {/* Wide screens: the links inline. */}
      <nav aria-label="Primary" className="hidden md:block">
        <ul className="flex items-center gap-5 text-sm md:gap-7">
          {siteConfig.navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={
                  isActive(item.href)
                    ? 'text-foreground underline decoration-accent decoration-2 underline-offset-8'
                    : 'text-secondary hover:text-foreground'
                }
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Narrow screens: a button and a sheet under the header. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-secondary hover:text-foreground md:hidden"
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span
            className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${
              open ? 'top-[7px] rotate-45' : 'top-0'
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] block h-0.5 w-5 bg-current transition-opacity ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${
              open ? 'top-[7px] -rotate-45' : 'top-[14px]'
            }`}
          />
        </span>
      </button>

      {open && (
        <>
          {/* A tap anywhere else closes the sheet. Transparent, because the
              header renders inside this stacking context and a tint here
              would wash it out. */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            aria-label="Primary"
            className="absolute inset-x-0 top-full z-50 border-b border-border bg-background shadow-sm md:hidden"
          >
            <ul className="flex flex-col px-5 py-1 sm:px-8">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`block border-b border-border py-3 text-base last:border-b-0 ${
                      isActive(item.href)
                        ? 'font-medium text-accent'
                        : 'text-secondary'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
