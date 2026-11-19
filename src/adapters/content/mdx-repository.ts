import type { Post, PostCategory, Tag } from '@/domain/types';
import type {
  CategoryCount,
  ContentRepository,
  PostNeighbours,
} from '@/domain/ports';
import {
  getContentPath,
  getMdxFiles,
  readMdxFile,
  extractSlugFromFilename,
} from './utils/file-reader';
import { postFrontmatterSchema } from './schemas/post-schema';
import { calculateReadingTime, countWords } from './utils/reading-time';
import { tagSlug } from '@/lib/slug';

/** Raw MDX body for an entry, frontmatter stripped. Null when missing. */
export async function readPostSource(slug: string): Promise<string | null> {
  const result = await readMdxFile(`${getContentPath('posts')}/${slug}.mdx`);
  return result ? result.content : null;
}

function collectTags(posts: Post[]): Tag[] {
  const counts = new Map<string, Tag>();

  for (const post of posts) {
    for (const raw of post.tags) {
      const slug = tagSlug(raw);
      if (!slug) continue;
      const existing = counts.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(slug, { name: raw, slug, count: 1 });
      }
    }
  }

  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export class MdxContentRepository implements ContentRepository {
  /** Parsed posts are cached per process — content is static at build time. */
  private postsCache: Promise<Post[]> | null = null;

  async getAllPosts(): Promise<Post[]> {
    if (!this.postsCache) {
      this.postsCache = this.loadPosts();
    }
    return this.postsCache;
  }

  private async loadPosts(): Promise<Post[]> {
    const postsDir = getContentPath('posts');
    const filenames = await getMdxFiles(postsDir);

    const posts = await Promise.all(
      filenames.map((filename) => this.parsePostFile(postsDir, filename))
    );

    return posts
      .filter((post): post is Post => post !== null)
      .filter((post) => post.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const posts = await this.getAllPosts();
    return posts.find((post) => post.slug === slug) ?? null;
  }

  /**
   * The entry to lead with.
   *
   * The newest post marked `featured: true` in its frontmatter, falling
   * back to the newest post so the slot is never empty.
   */
  async getFeaturedPost(): Promise<Post | null> {
    const posts = await this.getAllPosts();
    return posts.find((post) => post.featured) ?? posts[0] ?? null;
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter((post) => post.category === category);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    const wanted = tagSlug(tag);
    const allPosts = await this.getAllPosts();
    return allPosts.filter((post) =>
      post.tags.some((t) => tagSlug(t) === wanted)
    );
  }

  async getAllTags(): Promise<Tag[]> {
    return collectTags(await this.getAllPosts());
  }

  /** Tags used inside one folder, so a folder's filter only offers real hits. */
  async getTagsForCategory(category: string): Promise<Tag[]> {
    return collectTags(await this.getPostsByCategory(category));
  }

  async getCategoryCounts(): Promise<CategoryCount[]> {
    const allPosts = await this.getAllPosts();
    const counts = new Map<string, number>();

    for (const post of allPosts) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }

    return [...counts.entries()].map(([category, count]) => ({
      category,
      count,
    }));
  }

  /**
   * Related entries, ranked by shared tags then same folder.
   * Falls back to the most recent posts so the section is never empty.
   */
  async getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    const current = allPosts.find((p) => p.slug === slug);
    if (!current) return [];

    const currentTags = new Set(current.tags.map(tagSlug));

    const scored = allPosts
      .filter((post) => post.slug !== slug)
      .map((post) => {
        const shared = post.tags.filter((t) =>
          currentTags.has(tagSlug(t))
        ).length;
        const sameCategory = post.category === current.category ? 1 : 0;
        return { post, score: shared * 2 + sameCategory };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
      );

    return scored.slice(0, limit).map((s) => s.post);
  }

  async getPostNeighbours(slug: string): Promise<PostNeighbours> {
    const allPosts = await this.getAllPosts();
    const index = allPosts.findIndex((post) => post.slug === slug);

    if (index === -1) return { previous: null, next: null };

    // Posts are newest-first, so the *next* one to read is older.
    return {
      previous: allPosts[index - 1] ?? null,
      next: allPosts[index + 1] ?? null,
    };
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

    return {
      slug: extractSlugFromFilename(filename),
      ...parsed.data,
      category: parsed.data.category as PostCategory,
      readingTime: calculateReadingTime(result.content),
      wordCount: countWords(result.content),
    };
  }
}

export const contentRepository = new MdxContentRepository();
