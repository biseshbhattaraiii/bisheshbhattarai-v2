'use client';

import type { ReactNode } from 'react';
import { youtubeId } from '@/lib/passport/format';
import { removeAt, replaceAt, type Draft, type Patch } from './draft';
import { Field, Fieldset, dangerButton, smallButton } from './fields';

/** A list of short text items with add and remove. */
function ListEditor({ items, onChange, addLabel, render }: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  render: (value: string, set: (v: string) => void, i: number) => ReactNode;
}) {
  return (
    <div className="grid gap-3">
      {items.map((value, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">{render(value, (v) => onChange(replaceAt(items, i, v)), i)}</div>
          <button type="button" className={dangerButton} onClick={() => onChange(removeAt(items, i))} aria-label={`Remove item ${i + 1}`}>
            ✕
          </button>
        </div>
      ))}
      <div>
        <button type="button" className={smallButton} onClick={() => onChange([...items, ''])}>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

/** Story, lessons and films. */
export function WordsFieldset({ draft, patch }: { draft: Draft; patch: Patch }) {
  const dream = draft.status === 'dream';

  return (
    <Fieldset legend="Story, lessons and films">
      <Field label="The story" hint="Plain text. Leave a blank line between paragraphs.">
        <textarea className="field min-h-[12rem] resize-y leading-relaxed" value={draft.story} onChange={(e) => patch({ story: e.target.value })} />
      </Field>
      <div className="grid gap-1.5">
        <span className="label">{dream ? 'Why I want to go' : 'What it taught me'}</span>
        <ListEditor
          items={draft.insights}
          onChange={(insights) => patch({ insights })}
          addLabel="+ Add a note"
          render={(value, set, i) => (
            <textarea className="field resize-y" rows={2} value={value} aria-label={`Note ${i + 1}`} placeholder="A lesson, a realisation, a line to remember" onChange={(e) => set(e.target.value)} />
          )}
        />
      </div>
      <div className="grid gap-1.5">
        <span className="label">YouTube videos</span>
        <ListEditor
          items={draft.videos}
          onChange={(videos) => patch({ videos })}
          addLabel="+ Add a video"
          render={(value, set, i) => (
            <>
              <input className="field" value={value} aria-label={`Video ${i + 1}`} placeholder="https://youtu.be/…" onChange={(e) => set(e.target.value)} />
              {value.trim() && !youtubeId(value) && (
                <span className="mt-1 block text-xs text-red-600 dark:text-red-400">That doesn&apos;t look like a YouTube link.</span>
              )}
            </>
          )}
        />
        <p className="text-xs text-secondary">Upload to YouTube (unlisted is fine) and paste the link here.</p>
      </div>
    </Fieldset>
  );
}
