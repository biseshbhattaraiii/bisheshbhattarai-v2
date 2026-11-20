import { siteConfig } from '@/lib/config';
import { renderOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = siteConfig.title;
export const size = ogSize;
export const contentType = ogContentType;

export default function OgImage() {
  return renderOgImage({
    eyebrow: 'Diary',
    title: 'BISHESH.md',
    subtitle: siteConfig.description,
    footer: siteConfig.author.name,
    note: siteConfig.url.replace(/^https?:\/\//, ''),
  });
}
