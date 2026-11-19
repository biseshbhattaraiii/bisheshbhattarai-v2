'use client';

import Link from 'next/link';
import type { Photo as PhotoData } from '@/domain/types/passport';
import { tilt } from '@/lib/passport/format';
import { useGallery } from './gallery';
import { Photo } from './photo';

interface FromLink {
  href: string;
  title: string;
}

function FromLine({ from }: { from?: FromLink }) {
  if (!from) return null;
  return (
    <Link href={from.href} className="pp-label mt-2.5 block hover:underline">
      — {from.title}
    </Link>
  );
}

/** A taped, slightly crooked photo print. Click opens the viewer. */
export function Polaroid({ photo, seed, from }: { photo: PhotoData; seed: string; from?: FromLink }) {
  const { open } = useGallery();
  return (
    <figure className="pp-polaroid" style={{ transform: `rotate(${tilt(seed, 2.2).toFixed(2)}deg)` }}>
      <button type="button" className="block w-full cursor-zoom-in" onClick={() => open(photo.url)} aria-label={`Open photo${photo.caption ? `: ${photo.caption}` : ''}`}>
        <Photo src={photo.url} alt={photo.caption} />
      </button>
      {(photo.caption || from) && (
        <figcaption className="pp-caption">
          {photo.caption}
          <FromLine from={from} />
        </figcaption>
      )}
    </figure>
  );
}

/** A handwritten note on lined paper. */
export function NoteCard({ text, seed, from }: { text: string; seed: string; from?: FromLink }) {
  return (
    <div className="pp-note" style={{ transform: `rotate(${tilt(seed, 1.6).toFixed(2)}deg)` }}>
      <p>{text}</p>
      <FromLine from={from} />
    </div>
  );
}
