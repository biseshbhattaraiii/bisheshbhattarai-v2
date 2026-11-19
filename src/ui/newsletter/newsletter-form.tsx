'use client';

import { useId, useState, type FormEvent } from 'react';

/** Set once someone subscribes, so the popup never asks again. */
export const SUBSCRIBED_KEY = 'newsletter-subscribed';

interface NewsletterFormProps {
  heading?: string;
  blurb?: string;
  /** Drop the card chrome — for use inside a panel that already has it. */
  compact?: boolean;
  /** Called after a successful signup. */
  onSubscribed?: () => void;
}

/**
 * Signup for the newsletter.
 *
 * Posts to /api/subscribe, which decides which provider is in play. The
 * hidden "company" field is a honeypot; leave it in.
 */
export function NewsletterForm({
  heading = 'Get the weekly build log',
  blurb = 'What I shipped, what I charged, what broke. One email a week, no filler. Unsubscribe whenever.',
  compact = false,
  onSubscribed,
}: NewsletterFormProps) {
  // Several of these can share a page (inline, popup, footer), so the ids
  // have to be unique per instance.
  const headingId = useId();
  const emailId = useId();

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
        ok?: boolean;
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
      onSubscribed?.();
    } catch {
      setState('error');
      setMessage('Network error. Try again.');
    }
  }

  return (
    <section
      className={compact ? '' : 'card p-6 md:p-8'}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className={
          compact
            ? 'font-display text-xl font-semibold tracking-tight'
            : 'font-display text-2xl font-semibold tracking-tight'
        }
      >
        {heading}
      </h2>
      <p className="mt-2 max-w-prose text-secondary">{blurb}</p>

      <form onSubmit={onSubmit} className="mt-5 flex flex-wrap gap-3">
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
          className="field max-w-xs flex-1"
        />

        {/* Honeypot — hidden from people, irresistible to bots. */}
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
          className="rounded-md border border-accent bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {state === 'busy' ? 'Signing up…' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <p
          role="status"
          className={`mt-3 text-sm ${
            state === 'error' ? 'text-accent' : 'text-secondary'
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
