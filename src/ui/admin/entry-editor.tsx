'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { categories } from '@/lib/categories';
import { slugify } from '@/lib/slug';
import type { Suggestion } from '@/lib/ai/proofread';
import { SuggestionList } from './suggestion-list';

interface Draft {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
}

interface EntryEditorProps {
  /** Slug to load for editing; omit to start a blank entry. */
  initialSlug?: string;
  /** Today's date, passed from the server so the field is stable on first paint. */
  today: string;
}

const ASSIST_KEY = 'notebook-assist-enabled';
const IDLE_MS = 4000;

/**
 * The writing surface.
 *
 * The author types; the assist never does. When it is toggled on, the
 * current body is sent for a grammar check after a pause and comes back
 * as a list of suggestions that have to be applied one by one. Toggled
 * off, no request is ever made.
 */
export function EntryEditor({ initialSlug, today }: EntryEditorProps) {
  const [draft, setDraft] = useState<Draft>({
    slug: initialSlug ?? '',
    title: '',
    description: '',
    date: today,
    category: categories[0]?.slug ?? 'build-in-public',
    tags: '',
    published: false,
    featured: false,
  });
  const [body, setBody] = useState('');
  const [slugLocked, setSlugLocked] = useState(Boolean(initialSlug));
  const [loading, setLoading] = useState(Boolean(initialSlug));

  const [assistOn, setAssistOn] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState('');

  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inFlight = useRef<AbortController | null>(null);

  /* ── Load an existing entry ───────────────────────────────────── */

  useEffect(() => {
    if (!initialSlug) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `/api/admin/posts?slug=${encodeURIComponent(initialSlug)}`
        );
        if (!response.ok) throw new Error('not found');
        const data = (await response.json()) as {
          frontmatter: Record<string, unknown>;
          body: string;
        };
        if (cancelled) return;

        const fm = data.frontmatter;
        setDraft({
          slug: initialSlug,
          title: String(fm.title ?? ''),
          description: String(fm.description ?? ''),
          date: String(fm.date ?? today).slice(0, 10),
          category: String(fm.category ?? categories[0]?.slug ?? 'build-in-public'),
          tags: Array.isArray(fm.tags) ? fm.tags.join(', ') : '',
          published: fm.published !== false,
          featured: fm.featured === true,
        });
        setBody(data.body.trim());
      } catch {
        if (!cancelled) setStatus('Could not load that entry.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialSlug, today]);

  /* ── Assist preference ────────────────────────────────────────── */

  useEffect(() => {
    setAssistOn(localStorage.getItem(ASSIST_KEY) === 'on');
  }, []);

  function toggleAssist(next: boolean) {
    setAssistOn(next);
    localStorage.setItem(ASSIST_KEY, next ? 'on' : 'off');
    if (!next) {
      inFlight.current?.abort();
      setSuggestions([]);
      setAssistError(null);
      setChecking(false);
    }
  }

  /* ── Grammar check ────────────────────────────────────────────── */

  const runCheck = useCallback(
    async (text: string) => {
      if (text.trim().length < 12) return;

      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setChecking(true);
      setAssistError(null);

      try {
        const response = await fetch('/api/ai/proofread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        const data = (await response.json()) as {
          suggestions?: Suggestion[];
          truncated?: boolean;
          error?: string;
        };

        if (!response.ok) {
          setAssistError(data.error ?? 'The check failed.');
          return;
        }

        setSuggestions(data.suggestions ?? []);
        setLastChecked(text);
        if (data.truncated) {
          setAssistError('Only the first 12,000 characters were checked.');
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setAssistError('Could not reach the grammar service.');
        }
      } finally {
        if (inFlight.current === controller) {
          setChecking(false);
          inFlight.current = null;
        }
      }
    },
    []
  );

  // Check after a pause in typing, and only while the assist is on.
  useEffect(() => {
    if (!assistOn) return;
    if (body === lastChecked) return;
    if (body.trim().length < 40) return;

    const timer = setTimeout(() => void runCheck(body), IDLE_MS);
    return () => clearTimeout(timer);
  }, [assistOn, body, lastChecked, runCheck]);

  useEffect(() => () => inFlight.current?.abort(), []);

  /* ── Applying a suggestion ────────────────────────────────────── */

  function applySuggestion(suggestion: Suggestion) {
    setBody((previous) => {
      // Prefer the offset the check reported; fall back to a plain search
      // in case the text shifted while it was in flight.
      const atOffset =
        previous.slice(suggestion.start, suggestion.start + suggestion.original.length) ===
        suggestion.original
          ? suggestion.start
          : previous.indexOf(suggestion.original);

      if (atOffset === -1) return previous;

      const next =
        previous.slice(0, atOffset) +
        suggestion.suggestion +
        previous.slice(atOffset + suggestion.original.length);

      // Treat the applied result as already checked so accepting a fix
      // doesn't immediately trigger another billed round-trip.
      setLastChecked(next);
      return next;
    });

    setDismissed((ids) => [...ids, suggestion.id]);
  }

  function dismiss(id: string) {
    setDismissed((ids) => [...ids, id]);
  }

  /* ── Saving ───────────────────────────────────────────────────── */

  function toPayload(overwrite: boolean) {
    return {
      slug: draft.slug || slugify(draft.title),
      title: draft.title,
      description: draft.description,
      date: draft.date,
      category: draft.category,
      tags: draft.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      published: draft.published,
      featured: draft.featured,
      body,
      overwrite,
    };
  }

  async function save(overwrite = false) {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(overwrite)),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        code?: string;
        slug?: string;
        updated?: boolean;
      };

      if (response.status === 409 && data.code === 'exists') {
        if (
          window.confirm(
            `“${draft.slug}” already exists. Overwrite the file on disk?`
          )
        ) {
          await save(true);
        }
        return;
      }

      if (!response.ok) {
        setStatus(data.error ?? 'Could not save.');
        return;
      }

      setSlugLocked(true);
      setStatus(
        data.updated
          ? `Updated content/posts/${data.slug}.mdx`
          : `Wrote content/posts/${data.slug}.mdx`
      );
    } catch {
      setStatus('Network error while saving.');
    } finally {
      setSaving(false);
    }
  }

  function download() {
    const payload = toPayload(false);
    const frontmatter = [
      '---',
      `title: ${JSON.stringify(payload.title)}`,
      `description: ${JSON.stringify(payload.description)}`,
      `date: "${payload.date}"`,
      `category: "${payload.category}"`,
      `tags: [${payload.tags.map((t) => JSON.stringify(t)).join(', ')}]`,
      `published: ${payload.published}`,
      ...(payload.featured ? ['featured: true'] : []),
      '---',
      '',
    ].join('\n');

    const blob = new Blob([`${frontmatter}${body.trim()}\n`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${payload.slug || 'entry'}.mdx`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* ── Derived ──────────────────────────────────────────────────── */

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const open = suggestions.filter((s) => !dismissed.includes(s.id));
  const canSave =
    draft.title.trim() !== '' &&
    draft.description.trim() !== '' &&
    (draft.slug || slugify(draft.title)) !== '';

  if (loading) {
    return <p className="py-step-2 text-sm text-secondary">Opening…</p>;
  }

  return (
    <div className="grid gap-step-2 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div>
        {/* ── Frontmatter ──────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <input
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) => ({
                  ...d,
                  title,
                  slug: slugLocked ? d.slug : slugify(title),
                }));
              }}
              className={inputClass}
            />
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Slug">
            <input
              value={draft.slug}
              onChange={(e) => {
                setSlugLocked(true);
                setDraft((d) => ({ ...d, slug: e.target.value }));
              }}
              className={inputClass}
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="Divider">
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft((d) => ({ ...d, category: e.target.value }))
              }
              className={inputClass}
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tags (comma separated)">
            <input
              value={draft.tags}
              onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
              className={inputClass}
            />
          </Field>

          <div className="flex items-center gap-6 sm:col-span-2">
            <Checkbox
              label="Published"
              checked={draft.published}
              onChange={(published) => setDraft((d) => ({ ...d, published }))}
            />
            <Checkbox
              label="Featured"
              checked={draft.featured}
              onChange={(featured) => setDraft((d) => ({ ...d, featured }))}
            />
          </div>
        </div>

        {/* ── The page ─────────────────────────────────────────── */}
        <div className="mt-step-2">
          <div className="mb-2 flex items-baseline justify-between">
            <label
              htmlFor="entry-body"
              className="label"
            >
              Entry (MDX)
            </label>
            <span className="text-xs text-secondary">
              {words} words · {minutes} min
            </span>
          </div>
          <textarea
            id="entry-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck
            rows={26}
            placeholder="Write it yourself. The assist only comments."
            className="field min-h-[60vh] w-full resize-y font-mono leading-[1.7] sm:min-h-[28rem]"
          />
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !canSave}
            className="flex-1 rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 sm:flex-none"
          >
            {saving ? 'Saving…' : 'Save to content/'}
          </button>
          <button
            type="button"
            onClick={download}
            className="flex-1 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-secondary hover:border-accent/40 hover:text-accent sm:flex-none"
          >
            Download .mdx
          </button>
          {status && (
            <p role="status" className="text-sm text-secondary">
              {status}
            </p>
          )}
        </div>
      </div>

      {/* ── Assist ─────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-24">
        <div className="card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold">
                Grammar assist
              </h2>
              <p className="mt-0.5 text-xs text-secondary">
                {assistOn ? 'On · DeepSeek' : 'Off · nothing is sent'}
              </p>
            </div>
            <Switch checked={assistOn} onChange={toggleAssist} />
          </div>

          {assistOn && (
            <>
              <p className="mt-3 text-[0.8rem] leading-snug text-secondary">
                Checks spelling, agreement, tense and punctuation only. It will
                not rewrite your sentences, and nothing changes until you apply
                it.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void runCheck(body)}
                  disabled={checking || body.trim().length < 12}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-50"
                >
                  {checking ? 'Checking…' : 'Check now'}
                </button>
                {open.length > 0 && (
                  <span className="text-xs text-secondary">
                    {open.length} open
                  </span>
                )}
              </div>

              {assistError && (
                <p role="alert" className="mt-3 text-xs text-accent">
                  {assistError}
                </p>
              )}

              <SuggestionList
                suggestions={open}
                onApply={applySuggestion}
                onDismiss={dismiss}
                checked={lastChecked !== ''}
                checking={checking}
              />
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ── Small form pieces ─────────────────────────────────────────── */

const inputClass =
  'field';

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[rgb(var(--accent))]"
      />
      {label}
    </label>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Grammar assist"
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 shrink-0 rounded-full border px-0.5 ${
        checked ? 'border-accent bg-accent/20' : 'border-border bg-muted'
      }`}
    >
      <span
        className={`block h-4 w-4 rounded-full ${
          checked
            ? 'ml-auto bg-[rgb(var(--accent))]'
            : 'bg-[rgb(var(--secondary))]'
        }`}
      />
    </button>
  );
}
