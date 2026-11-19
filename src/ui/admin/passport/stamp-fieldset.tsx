'use client';

import { INKS, SHAPES } from '@/lib/passport/kinds';
import { Stamp } from '@/ui/passport/stamp';
import type { Draft, Patch } from './draft';
import { Choice, Fieldset } from './fields';

const inkLabel = (ink: string) => ink[0]?.toUpperCase() + ink.slice(1);

/** Shape and ink, with a live preview printed on passport paper. */
export function StampFieldset({ draft, patch }: { draft: Draft; patch: Patch }) {
  const preview = {
    ...draft,
    slug: draft.slug || 'draft',
    days: draft.days.map((d) => ({ ...d, altitudeM: d.altitudeM ? Number(d.altitudeM) : null })),
    maxAltitudeM: draft.maxAltitudeM ? Number(draft.maxAltitudeM) : null,
  };

  return (
    <Fieldset legend="The stamp">
      <div className="grid items-center gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="pp grid place-items-center rounded-md p-3">
          <Stamp entry={preview} flat idSuffix="-preview" className="w-[160px]" />
        </div>
        <div className="grid gap-4">
          <Choice
            label="Shape"
            value={draft.stamp.shape}
            options={SHAPES.map((s) => ({ value: s.shape, label: s.label }))}
            onChange={(shape) => patch({ stamp: { ...draft.stamp, shape } })}
          />
          <div className="grid gap-1.5">
            <span className="label">Ink</span>
            <div className="pp flex flex-wrap gap-2 rounded-md p-1" style={{ background: 'transparent' }} role="radiogroup" aria-label="Ink">
              {INKS.map((ink) => (
                <button
                  key={ink}
                  type="button"
                  role="radio"
                  aria-checked={draft.stamp.ink === ink}
                  aria-label={`${inkLabel(ink)} ink`}
                  onClick={() => patch({ stamp: { ...draft.stamp, ink } })}
                  className={`ink-${ink} h-8 w-8 rounded-full border-[3px] border-white`}
                  style={{
                    background: 'currentColor',
                    boxShadow: draft.stamp.ink === ink ? '0 0 0 2.5px rgb(var(--foreground))' : '0 0 0 1px rgb(var(--border))',
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-secondary">
            The stamp prints the title, the place, the start date and the highest point or number of days.
          </p>
        </div>
      </div>
    </Fieldset>
  );
}
