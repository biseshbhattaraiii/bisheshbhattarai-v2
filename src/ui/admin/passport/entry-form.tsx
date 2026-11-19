'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BasicsFieldset } from './basics-fieldset';
import { DaysFieldset } from './days-fieldset';
import { toPayload, type Draft, type Patch } from './draft';
import { dangerButton } from './fields';
import { PhotosFieldset } from './photos-fieldset';
import { StampFieldset } from './stamp-fieldset';
import { discardPhoto } from './upload';
import { WordsFieldset } from './words-fieldset';

interface EntryFormProps {
  initial: Draft;
  /** Slug as stored, or null for a new entry. */
  originalSlug: string | null;
}

async function send(method: 'POST' | 'DELETE', url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 401) throw new Error('Your session expired. Sign in again in another tab, then save.');
  if (!res.ok) throw new Error(json.error ?? 'Something went wrong. Try again.');
}

export function EntryForm({ initial, originalSlug }: EntryFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState<string | null>(originalSlug);
  const [autoSlug, setAutoSlug] = useState(!originalSlug);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [armed, setArmed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const uploads = useRef(new Set<string>());

  const patch: Patch = useCallback((change) => {
    setDraft((d) => ({ ...d, ...(typeof change === 'function' ? change(d) : change) }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function save() {
    if (!draft.title.trim()) return setStatus({ tone: 'error', text: 'Give it a title first.' });
    if (!draft.slug) return setStatus({ tone: 'error', text: 'Add a slug for the URL.' });
    setBusy(true);
    setStatus(null);
    try {
      await send('POST', '/api/admin/passport', { entry: toPayload(draft), originalSlug: saved });
      setSaved(draft.slug);
      setAutoSlug(false);
      setDirty(false);
      uploads.current.clear();
      setStatus({ tone: 'ok', text: saved ? 'Saved.' : 'Stamped. It is in your passport now.' });
      if (!saved) router.replace(`/admin/passport/edit?slug=${encodeURIComponent(draft.slug)}`);
    } catch (error) {
      setStatus({ tone: 'error', text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!saved) return;
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
      return;
    }
    setBusy(true);
    try {
      await send('DELETE', `/api/admin/passport?slug=${encodeURIComponent(saved)}`);
      setDirty(false);
      router.push('/admin/passport');
    } catch (error) {
      setStatus({ tone: 'error', text: (error as Error).message });
      setBusy(false);
    }
  }

  function cancel() {
    uploads.current.forEach(discardPhoto);
    setDirty(false);
    router.push('/admin/passport');
  }

  return (
    <form className="grid max-w-content gap-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <BasicsFieldset draft={draft} patch={patch} autoSlug={autoSlug} onSlugEdited={() => setAutoSlug(false)} />
      <StampFieldset draft={draft} patch={patch} />
      <PhotosFieldset draft={draft} patch={patch} onUploaded={(u) => uploads.current.add(u)} onBusyChange={setUploading} />
      <DaysFieldset draft={draft} patch={patch} />
      <WordsFieldset draft={draft} patch={patch} />

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 py-3 backdrop-blur">
        <button type="submit" disabled={busy || uploading} className="rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {uploading ? 'Uploading photos…' : busy ? 'Saving…' : saved ? 'Save changes' : 'Stamp it'}
        </button>
        <button type="button" onClick={cancel} className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-secondary hover:text-accent">
          {dirty ? 'Discard changes' : 'Back'}
        </button>
        {saved && draft.published && !dirty && (
          <Link href={`/passport/${saved}`} className="text-sm text-secondary hover:text-accent" target="_blank">
            View it →
          </Link>
        )}
        {status && (
          <p role="status" className={`text-sm ${status.tone === 'error' ? 'text-red-600 dark:text-red-400' : 'text-secondary'}`}>
            {status.text}
          </p>
        )}
        {saved && (
          <button type="button" onClick={remove} disabled={busy} className={`ml-auto ${dangerButton} ${armed ? 'bg-red-500/15' : ''}`}>
            {armed ? 'Click again to delete' : 'Delete entry'}
          </button>
        )}
      </div>
    </form>
  );
}
