export interface SiteConfig {
  name: string;
  description: string;
  author: {
    name: string;
    bio: string;
    email: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  navigation: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  href: string;
}
