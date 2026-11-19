import type { ImgHTMLAttributes } from 'react';
import { RidgeArt } from './ridge-art';

interface PhotoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  /** Seed for the drawn placeholder when there is no photo. */
  seed?: string;
}

/**
 * Plain <img> on purpose: photos come from Blob storage at their own
 * sizes, already resized in the browser before upload. With no source,
 * a drawn mountain silhouette stands in.
 */
export function Photo({ src, seed = 'placeholder', alt = '', ...rest }: PhotoProps) {
  if (!src) return <RidgeArt seed={seed} className={rest.className} label={alt} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" {...rest} />;
}
