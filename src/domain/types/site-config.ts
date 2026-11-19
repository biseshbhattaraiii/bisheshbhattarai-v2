export interface SiteConfig {
  name: string;
  /** Full document title for the home page. */
  title: string;
  description: string;
  /** Canonical origin, no trailing slash. */
  url: string;
  locale: string;
  keywords: string[];
  author: {
    name: string;
    bio: string;
    jobTitle: string;
    email: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    instagram?: string;
  };
  navigation: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  href: string;
}
