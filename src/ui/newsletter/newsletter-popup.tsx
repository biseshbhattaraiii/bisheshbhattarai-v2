'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NewsletterForm, SUBSCRIBED_KEY } from './newsletter-form';

const DISMISSED_KEY = 'newsletter-popup-dismissed';

/**
 * First-visit newsletter invitation.
 *
 * Shows once per browser, as soon as the page mounts, and never again
 * after it is closed or the reader subscribes. It is skipped entirely in
 * the back office and for anyone who asked for reduced motion to be
 * respected — there is no motion here, but the same people tend to want
 * fewer interruptions.
 */
export function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    try {
      if (
        localStorage.getItem(DISMISSED_KEY) === '1' ||
        localStorage.getItem(SUBSCRIBED_KEY) === '1'
      ) {
        return;
      }
    } catch {
      // Storage blocked — don't nag someone we can't remember.
      return;
    }

    setOpen(true);
  }, [pathname]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* nothing to remember it with */
    }
    previouslyFocused.current?.focus();
  }

  // Escape closes, focus moves in, and the page behind stops scrolling.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
    // `close` is stable enough for this effect's purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Newsletter signup"
        className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-card md:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-lg leading-none text-secondary hover:text-accent"
        >
          ×
        </button>

        <NewsletterForm
          compact
          heading="Before you read on"
          blurb="I write one email a week about building internet products in public: what shipped, what it earned, what failed. No filler, unsubscribe anytime."
          onSubscribed={() =>
            setTimeout(() => {
              setOpen(false);
              previouslyFocused.current?.focus();
            }, 1600)
          }
        />

        <button
          type="button"
          onClick={close}
          className="mt-4 text-sm text-secondary underline underline-offset-4 hover:text-accent"
        >
          No thanks, take me to the writing
        </button>
      </div>
    </div>
  );
}
