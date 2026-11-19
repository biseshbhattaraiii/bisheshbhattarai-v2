'use client';

import type { EntryKind, EntryStatus } from '@/domain/types/passport';
import { kindMeta, kinds } from '@/lib/passport/kinds';
import { slugify } from '@/lib/passport/format';
import type { Draft, Patch } from './draft';
import { Choice, Field, Fieldset } from './fields';

interface BasicsProps {
  draft: Draft;
  patch: Patch;
  /** False once the slug has been typed by hand or the entry was saved. */
  autoSlug: boolean;
  onSlugEdited: () => void;
}

export function BasicsFieldset({ draft, patch, autoSlug, onSlugEdited }: BasicsProps) {
  const meta = kindMeta(draft.kind);
  const dream = draft.status === 'dream';

  function setKind(kind: EntryKind) {
    const next = kindMeta(kind);
    const stampWasDefault = draft.stamp.shape === meta.shape && draft.stamp.ink === meta.ink;
    patch({ kind, ...(stampWasDefault ? { stamp: { shape: next.shape, ink: next.ink } } : {}) });
  }

  return (
    <Fieldset legend="The basics">
      <Choice
        label="Kind"
        value={draft.kind}
        options={kinds.map((k) => ({ value: k.kind, label: k.label }))}
        onChange={setKind}
      />
      <p className="-mt-2 text-xs text-secondary">{meta.hint}</p>
      <Choice<EntryStatus>
        label="Status"
        value={draft.status}
        options={[
          { value: 'done', label: 'Done it' },
          { value: 'dream', label: 'Wish list' },
        ]}
        onChange={(status) => patch({ status })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            className="field"
            value={draft.title}
            maxLength={120}
            placeholder={meta.kind === 'trek' ? 'Annapurna Base Camp' : 'Give it a name'}
            onChange={(e) => patch({ title: e.target.value, ...(autoSlug ? { slug: slugify(e.target.value) } : {}) })}
          />
        </Field>
        <Field label="Slug" hint={`bisheshbhattarai.com/passport/${draft.slug || '…'}`}>
          <input
            className="field font-mono"
            value={draft.slug}
            onChange={(e) => {
              onSlugEdited();
              patch({ slug: slugify(e.target.value) });
            }}
          />
        </Field>
        <Field label="Where" hint="Region, country or city">
          <input className="field" value={draft.place} maxLength={120} onChange={(e) => patch({ place: e.target.value })} />
        </Field>
        {dream ? (
          <Field label="Target" hint="e.g. Spring 2027">
            <input className="field" value={draft.target} maxLength={60} onChange={(e) => patch({ target: e.target.value })} />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input type="date" className="field" value={draft.startDate} onChange={(e) => patch({ startDate: e.target.value })} />
            </Field>
            <Field label="End">
              <input type="date" className="field" value={draft.endDate} onChange={(e) => patch({ endDate: e.target.value })} />
            </Field>
          </div>
        )}
        {meta.distance && (
          <Field label="Distance (km)">
            <input className="field" inputMode="decimal" value={draft.distanceKm} onChange={(e) => patch({ distanceKm: e.target.value })} />
          </Field>
        )}
        {meta.altitude && (
          <Field label="Highest point (m)">
            <input className="field" inputMode="numeric" value={draft.maxAltitudeM} onChange={(e) => patch({ maxAltitudeM: e.target.value })} />
          </Field>
        )}
        {meta.companions && (
          <Field label="With" hint="Friends, a guide, solo…" className="sm:col-span-2">
            <input className="field" value={draft.companions} maxLength={200} onChange={(e) => patch({ companions: e.target.value })} />
          </Field>
        )}
        <Field label="In one line" hint="Shown in handwriting under the title" className="sm:col-span-2">
          <textarea className="field resize-y" rows={2} maxLength={400} value={draft.summary} onChange={(e) => patch({ summary: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.published} onChange={(e) => patch({ published: e.target.checked })} />
        Published (unticked entries stay private)
      </label>
    </Fieldset>
  );
}
