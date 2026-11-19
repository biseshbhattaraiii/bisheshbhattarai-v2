'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Holder } from '@/domain/types/passport';
import { Photo } from '@/ui/passport/photo';
import { Field, Fieldset, smallButton } from './fields';
import { discardPhoto, uploadPhoto } from './upload';

/** Name, home base, motto and the passport photo. */
export function HolderForm({ initial }: { initial: Holder }) {
  const router = useRouter();
  const [holder, setHolder] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

  const set = (change: Partial<Holder>) => setHolder((h) => ({ ...h, ...change }));

  async function choosePhoto(file: File) {
    setBusy(true);
    setMessage('');
    try {
      const url = await uploadPhoto(file);
      if (newPhoto) discardPhoto(newPhoto);
      setNewPhoto(url);
      set({ photo: url });
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/passport/holder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holder),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) return setMessage(json.error ?? 'Could not save. Try again.');
    router.push('/admin/passport');
    router.refresh();
  }

  return (
    <form className="grid max-w-content gap-6" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <Fieldset legend="Passport holder">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name on the passport">
            <input className="field" value={holder.name} maxLength={80} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Home base">
            <input className="field" value={holder.homeBase} maxLength={80} placeholder="Kathmandu" onChange={(e) => set({ homeBase: e.target.value })} />
          </Field>
          <Field label="Motto" className="sm:col-span-2">
            <input className="field" value={holder.motto} maxLength={200} placeholder="Walk slowly. Look up often." onChange={(e) => set({ motto: e.target.value })} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Photo src={holder.photo} seed="holder" alt="" className="aspect-[4/5] w-24 rounded border border-border object-cover" />
          <label className={`${smallButton} cursor-pointer`}>
            {holder.photo ? 'Change photo' : 'Add a passport photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void choosePhoto(f); e.target.value = ''; }} />
          </label>
          {holder.photo && (
            <button type="button" className={smallButton} onClick={() => set({ photo: '' })}>
              Remove photo
            </button>
          )}
        </div>
      </Fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {busy ? 'Working…' : 'Save details'}
        </button>
        {message && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{message}</p>}
      </div>
    </form>
  );
}
