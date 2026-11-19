'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { Container } from '@/ui/common';
import { SUBSCRIBED_KEY } from './newsletter-form';

/**
 * One-line signup strip that sits above the header.
 *
 * Same endpoint as the full form, stripped to a label and a field so it
 * reads as part of the chrome rather than a section of the page. Closing it
 * lasts for the page view only: it is back on the next load. Being on the
 * list, unlike closing it, is remembered.
 */
export function NewsletterBar() {
  const emailId = useId();

  const [dismissed, setDismissed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Read after mount so the server and first client render agree.
  useEffect(() => {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) setSubscribed(true);
    } catch {
      /* storage blocked; show the bar */
    }
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setState('busy');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      });

      const data = (await response.json()) as {
        status?: string;
        error?: string;
      };

      if (!response.ok) {
        setState('error');
        setMessage(data.error ?? 'Something went wrong.');
        return;
      }

      setState('done');
      setMessage(
        data.status === 'already'
          ? 'You are already on the list.'
          : data.status === 'pending'
            ? 'Almost there. Confirm the link in your inbox.'
            : 'You are on the list. Talk soon.'
      );
      setEmail('');

      try {
        localStorage.setItem(SUBSCRIBED_KEY, '1');
      } catch {
        /* storage blocked; nothing to remember it with */
      }
    } catch {
      setState('error');
      setMessage('Network error. Try again.');
    }
  }

  if (dismissed || (subscribed && state !== 'done')) return null;

  return (
    <div className="bg-accent text-xs text-white">
      <Container className="flex h-8 items-center gap-x-3 sm:gap-x-4">
        {/* The field needs most of the row on a phone, so the pitch shortens
            rather than pushing the button off the edge. */}
        <p className="shrink-0 font-medium">
          <span className="sm:hidden">Weekly log</span>
          <span className="hidden sm:inline">Get the weekly build log</span>
        </p>

        {state === 'done' ? (
          <p role="status" className="flex-1 truncate text-white/90">
            {message}
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex flex-1 items-center justify-end gap-2"
          >
            {state === 'error' && message && (
              <p role="status" className="hidden truncate text-white/90 sm:block">
                {message}
              </p>
            )}

            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-6 w-full min-w-0 flex-1 rounded border border-white/40 bg-white/15 px-2 text-xs text-white outline-none placeholder:text-white/70 focus:border-white sm:w-56 sm:flex-none"
            />

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <input
              type="text"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <button
              type="submit"
              disabled={state === 'busy'}
              className="h-6 shrink-0 rounded bg-white px-3 text-xs font-medium text-accent hover:bg-white/90 disabled:opacity-50"
            >
              {state === 'busy' ? 'Signing up…' : 'Subscribe'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close"
          className="-mr-2 flex h-8 w-8 shrink-0 items-center justify-center text-base leading-none text-white/80 hover:text-white"
        >
          ×
        </button>
      </Container>
    </div>
  );
}
