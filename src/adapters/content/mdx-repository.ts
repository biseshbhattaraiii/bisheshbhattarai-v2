import type { Post } from '@/domain/types';
import type { ContentRepository } from '@/domain/ports';
import {
  getContentPath,
  getMdxFiles,
  readMdxFile,
  extractSlugFromFilename,
} from './utils/file-reader';
import { postFrontmatterSchema } from './schemas/post-schema';
import { projectFrontmatterSchema } from './schemas/project-schema';
import { calculateReadingTime } from './utils/reading-time';
import type { Project } from '@/domain/types';

export class MdxContentRepository implements ContentRepository {
  async getAllPosts(): Promise<Post[]> {
    const postsDir = getContentPath('posts');
    const filenames = await getMdxFiles(postsDir);

    const posts = await Promise.all(
      filenames.map((filename) => this.parsePostFile(postsDir, filename))
    );

    return posts
      .filter((post): post is Post => post !== null)
      .filter((post) => post.published)
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const postsDir = getContentPath('posts');
    return this.parsePostFile(postsDir, `${slug}.mdx`);
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter((post) => post.category === category);
  }

  async getAllProjects(): Promise<Project[]> {
    const projectsDir = getContentPath('projects');
    const filenames = await getMdxFiles(projectsDir);

    const projects = await Promise.all(
      filenames.map((filename) =>
        this.parseProjectFile(projectsDir, filename)
      )
    );

    return projects
      .filter((project): project is Project => project !== null)
      .sort((a, b) => a.order - b.order);
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const projectsDir = getContentPath('projects');
    return this.parseProjectFile(projectsDir, `${slug}.mdx`);
  }

  async getFeaturedProjects(): Promise<Project[]> {
    const allProjects = await this.getAllProjects();
    return allProjects.filter((project) => project.featured);
  }

  private async parsePostFile(
    directory: string,
    filename: string
  ): Promise<Post | null> {
    const filePath = `${directory}/${filename}`;
    const result = await readMdxFile(filePath);

    if (!result) {
      return null;
    }

    const parsed = postFrontmatterSchema.safeParse(result.data);
    if (!parsed.success) {
      console.error(`Invalid post frontmatter: ${filename}`, parsed.error);
      return null;
    }

    const slug = extractSlugFromFilename(filename);
    const readingTime = calculateReadingTime(result.content);

    return {
      slug,
      ...parsed.data,
      readingTime,
    };
  }

  private async parseProjectFile(
    directory: string,
    filename: string
  ): Promise<Project | null> {
    const filePath = `${directory}/${filename}`;
    const result = await readMdxFile(filePath);

    if (!result) {
      return null;
    }

    const parsed = projectFrontmatterSchema.safeParse(result.data);
    if (!parsed.success) {
      console.error(
        `Invalid project frontmatter: ${filename}`,
        parsed.error
      );
      return null;
    }

    const slug = extractSlugFromFilename(filename);

    return {
      slug,
      ...parsed.data,
    };
  }
}

export const contentRepository = new MdxContentRepository();
