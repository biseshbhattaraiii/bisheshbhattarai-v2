import type { SiteConfig } from '@/domain/types';

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deploy environment so
 * preview builds don't advertise production URLs.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bisheshbhattarai.com'
).replace(/\/$/, '');

/**
 * The writing lives on Substack. Every call to action on this site points
 * there: there is nothing to subscribe to here.
 */
export const substackUrl = 'https://bishes.substack.com';

export const siteConfig: SiteConfig = {
  name: 'Bishesh Bhattarai',
  title: 'Bishesh Bhattarai · I build internet products',
  description:
    'I build internet products. The notebook, with everything I write, is at bishes.substack.com.',
  url: siteUrl,
  locale: 'en_AU',
  author: {
    name: 'Bishesh Bhattarai',
    bio: 'I build internet products in public, and write down what actually happens.',
    jobTitle: 'Founder & Product Builder',
    email: 'hello@bisheshbhattarai.com',
    // [[Replace with your real handles — leave a field out to hide the link]]
    github: 'bisheshbhattarai',
    twitter: 'bisheshbhattarai',
    linkedin: 'bisheshbhattarai',
    youtube: '[[@yourchannel]]',
    tiktok: '[[@yourhandle]]',
    instagram: '[[yourhandle]]',
  },
  keywords: [
    'Bishesh Bhattarai',
    'build in public',
    'indie SaaS',
    'software agency',
    'bootstrapped SaaS',
    'agency owner',
    'SaaS revenue',
    'founder journal',
  ],
  // Deliberately empty: the site shows one page and links out.
  navigation: [],
};

/** Absolute URL helper — every canonical, OG and sitemap entry goes through this. */
export function absoluteUrl(path = '/'): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/** A handle is only shown when it has been filled in. */
export function hasHandle(value?: string): value is string {
  return Boolean(value) && !value!.includes('[[');
}

export interface SocialLink {
  label: string;
  href: string;
}

/** Social profiles, in the order they should appear. */
export function socialLinks(): SocialLink[] {
  const { author } = siteConfig;
  const links: SocialLink[] = [];

  if (hasHandle(author.youtube)) {
    links.push({
      label: 'YouTube',
      href: `https://youtube.com/${author.youtube.replace(/^@?/, '@')}`,
    });
  }
  if (hasHandle(author.tiktok)) {
    links.push({
      label: 'TikTok',
      href: `https://tiktok.com/${author.tiktok.replace(/^@?/, '@')}`,
    });
  }
  if (hasHandle(author.instagram)) {
    links.push({
      label: 'Instagram',
      href: `https://instagram.com/${author.instagram.replace(/^@/, '')}`,
    });
  }
  if (hasHandle(author.twitter)) {
    links.push({ label: 'X', href: `https://x.com/${author.twitter}` });
  }
  if (hasHandle(author.linkedin)) {
    links.push({
      label: 'LinkedIn',
      href: `https://linkedin.com/in/${author.linkedin}`,
    });
  }
  if (hasHandle(author.github)) {
    links.push({
      label: 'GitHub',
      href: `https://github.com/${author.github}`,
    });
  }

  return links;
}
