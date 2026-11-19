'use client';

import { useState, type DragEvent } from 'react';
import { Photo } from '@/ui/passport/photo';
import { removeAt, replaceAt, type Draft, type Patch } from './draft';
import { Fieldset, dangerButton, smallButton } from './fields';
import { uploadPhoto } from './upload';

interface PhotosProps {
  draft: Draft;
  patch: Patch;
  /** Reports each new upload so an abandoned edit can clean up after itself. */
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}

export function PhotosFieldset({ draft, patch, onUploaded, onBusyChange }: PhotosProps) {
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [over, setOver] = useState(false);

  async function add(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name));
    if (!list.length) return;
    setErrors([]);
    setPending((n) => n + list.length);
    onBusyChange(true);
    const added: string[] = [];
    const failed: string[] = [];
    await Promise.all(
      list.map(async (file) => {
        try {
          const url = await uploadPhoto(file);
          added.push(url);
          onUploaded(url);
        } catch (error) {
          failed.push((error as Error).message);
        }
      })
    );
    patch((latest) => ({ photos: [...latest.photos, ...added.map((url) => ({ url, caption: '' }))] }));
    setPending((n) => n - list.length);
    onBusyChange(false);
    setErrors(failed);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    void add(e.dataTransfer.files);
  }

  const cover = draft.photos.some((p) => p.url === draft.cover) ? draft.cover : draft.photos[0]?.url;

  return (
    <Fieldset legend="Photos">
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`block cursor-pointer rounded-md border-2 border-dashed p-5 text-center text-sm ${over ? 'border-accent text-accent' : 'border-border text-secondary'}`}
      >
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => { if (e.target.files) void add(e.target.files); e.target.value = ''; }} />
        {pending > 0 ? `Uploading ${pending} ${pending === 1 ? 'photo' : 'photos'}…` : 'Drop photos here or click to choose. They are resized before upload.'}
      </label>
      {errors.length > 0 && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{errors.join(' ')}</p>
      )}
      {draft.photos.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {draft.photos.map((photo, i) => (
            <div key={photo.url} className="grid gap-2 rounded-md border border-border p-2">
              <Photo src={photo.url} alt="" className="aspect-[4/3] w-full rounded object-cover" />
              <input
                className="field text-sm"
                placeholder="Caption"
                aria-label={`Caption for photo ${i + 1}`}
                value={photo.caption}
                maxLength={300}
                onChange={(e) => patch({ photos: replaceAt(draft.photos, i, { ...photo, caption: e.target.value }) })}
              />
              <div className="flex justify-between gap-2">
                <button type="button" className={smallButton} disabled={cover === photo.url} onClick={() => patch({ cover: photo.url })}>
                  {cover === photo.url ? 'Cover' : 'Make cover'}
                </button>
                <button
                  type="button"
                  className={dangerButton}
                  onClick={() =>
                    patch({
                      photos: removeAt(draft.photos, i),
                      days: draft.days.map((d) => (d.photo === photo.url ? { ...d, photo: '' } : d)),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Fieldset>
  );
}
