'use client';

import { kindMeta } from '@/lib/passport/kinds';
import { removeAt, replaceAt, type DayDraft, type Draft, type Patch } from './draft';
import { Field, Fieldset, dangerButton, smallButton } from './fields';

const blankDay: DayDraft = { place: '', altitudeM: '', note: '', photo: '' };

/** The day-by-day log for treks and trips. */
export function DaysFieldset({ draft, patch }: { draft: Draft; patch: Patch }) {
  const meta = kindMeta(draft.kind);
  if (!meta.days || draft.status === 'dream') return null;

  const setDay = (i: number, change: Partial<DayDraft>) => {
    const day = draft.days[i];
    if (day) patch({ days: replaceAt(draft.days, i, { ...day, ...change }) });
  };

  return (
    <Fieldset legend="Day by day">
      {draft.days.map((day, i) => (
        <div key={i} className="grid gap-3 border-b border-dashed border-border pb-4 last:border-0">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Day {i + 1}</span>
            <button type="button" className={dangerButton} onClick={() => patch({ days: removeAt(draft.days, i) })}>
              Remove day
            </button>
          </div>
          <div className={`grid gap-3 ${meta.altitude ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            <Field label="Where">
              <input className="field" value={day.place} placeholder="Chhomrong → Bamboo" onChange={(e) => setDay(i, { place: e.target.value })} />
            </Field>
            {meta.altitude && (
              <Field label="Slept at (m)">
                <input className="field" inputMode="numeric" value={day.altitudeM} onChange={(e) => setDay(i, { altitudeM: e.target.value })} />
              </Field>
            )}
            <Field label="Photo">
              <select className="field" value={day.photo} onChange={(e) => setDay(i, { photo: e.target.value })}>
                <option value="">No photo</option>
                {draft.photos.map((p, j) => (
                  <option key={p.url} value={p.url}>
                    Photo {j + 1}
                    {p.caption ? ` · ${p.caption.slice(0, 30)}` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="What happened">
            <textarea className="field resize-y" rows={3} value={day.note} onChange={(e) => setDay(i, { note: e.target.value })} />
          </Field>
        </div>
      ))}
      <div>
        <button type="button" className={smallButton} onClick={() => patch({ days: [...draft.days, blankDay] })}>
          + Add day {draft.days.length + 1}
        </button>
      </div>
      {meta.altitude && <p className="text-xs text-secondary">Altitudes draw the elevation profile on the entry page.</p>}
    </Fieldset>
  );
}
