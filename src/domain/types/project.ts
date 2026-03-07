export interface Project {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
}
