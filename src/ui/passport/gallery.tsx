'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Photo as PhotoData } from '@/domain/types/passport';
import { Photo } from './photo';

interface GalleryApi {
  open: (url: string) => void;
}

const GalleryContext = createContext<GalleryApi>({ open: () => undefined });

function Lightbox({ photos, index, onMove, onClose }: {
  photos: PhotoData[];
  index: number;
  onMove: (delta: number) => void;
  onClose: () => void;
}) {
  const photo = photos[index] ?? photos[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onMove]);

  if (!photo) return null;

  return (
    <div className="pp-lightbox" role="dialog" aria-modal="true" aria-label="Photo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" className="right-4 top-4" onClick={onClose} autoFocus>
        Close
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" className="left-4 top-1/2" aria-label="Previous photo" onClick={() => onMove(-1)}>‹</button>
          <button type="button" className="right-4 top-1/2" aria-label="Next photo" onClick={() => onMove(1)}>›</button>
        </>
      )}
      <figure className="m-0 grid max-w-full justify-items-center gap-2.5">
        <Photo src={photo.url} alt={photo.caption} />
        {photo.caption && (
          <figcaption className="pp-hand max-w-[60ch] text-center text-[26px] text-[#f1ead2]">{photo.caption}</figcaption>
        )}
      </figure>
    </div>
  );
}

/** Lets any photo on an entry page open the full-screen viewer. */
export function GalleryProvider({ photos, children }: { photos: PhotoData[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback(
    (url: string) => setIndex(Math.max(0, photos.findIndex((p) => p.url === url))),
    [photos]
  );
  const move = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );
  const close = useCallback(() => setIndex(null), []);

  return (
    <GalleryContext.Provider value={{ open }}>
      {children}
      {index !== null && photos[index] && (
        <Lightbox photos={photos} index={index} onMove={move} onClose={close} />
      )}
    </GalleryContext.Provider>
  );
}

/** A clickable photo that opens the viewer. */
export function GalleryPhoto({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const { open } = useContext(GalleryContext);
  return (
    <button type="button" onClick={() => open(url)} className="block w-full cursor-zoom-in" aria-label={`Open photo${alt ? `: ${alt}` : ''}`}>
      <Photo src={url} alt={alt} className={className} />
    </button>
  );
}

export function useGallery(): GalleryApi {
  return useContext(GalleryContext);
}
