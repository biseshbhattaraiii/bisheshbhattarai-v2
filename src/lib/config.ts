import type { SiteConfig } from '@/domain/types';

export const siteConfig: SiteConfig = {
  name: 'Bishesh Bhattarai',
  description:
    'Runner, walker, car enthusiast — documenting life, code, and the journey',
  author: {
    name: 'Bishesh Bhattarai',
    bio: 'Builder, runner, and explorer documenting the journey',
    email: 'hello@bisheshbhattarai.com',
    github: 'bisheshbhattarai',
    twitter: 'bisheshbhattarai',
    linkedin: 'bisheshbhattarai',
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Journal', href: '/journal' },
    { label: 'Projects', href: '/projects' },
    { label: 'Now', href: '/now' },
  ],
};
