import type { Post } from '../types/post';
import type { Project } from '../types/project';

export interface ContentRepository {
  getAllPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostsByCategory(category: string): Promise<Post[]>;
  getAllProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getFeaturedProjects(): Promise<Project[]>;
}
