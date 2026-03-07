import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { format } from 'date-fns';
import { contentRepository } from '@/adapters/content';
import { Container, Tag } from '@/ui/common';
import { ReadingProgress } from '@/ui/animations';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await contentRepository.getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

async function getPostContent(slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { content } = matter(fileContent);
    return content;
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await contentRepository.getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await getPostContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <article className="py-12">
        <Container className="max-w-3xl">
          <header className="mb-8">
            <div className="mb-4">
              <Tag>{post.category}</Tag>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-secondary">
              <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
              {post.readingTime && <span>{post.readingTime} min read</span>}
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            <MDXRemote source={content} />
          </div>
        </Container>
      </article>
    </>
  );
}
