import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'fs/promises';
import path from 'path';
import { Container } from '@/ui/common';
import { FadeIn } from '@/ui/animations';

async function getNowContent() {
  const filePath = path.join(process.cwd(), 'content', 'now.mdx');
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent;
  } catch {
    return null;
  }
}

export default async function NowPage() {
  const content = await getNowContent();

  return (
    <div className="py-12">
      <Container className="max-w-3xl">
        <FadeIn>
          <h1 className="text-5xl font-bold font-display mb-6">Now</h1>
          <p className="text-xl text-secondary mb-12">
            What I'm currently focused on
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          {content ? (
            <div className="prose prose-lg max-w-none">
              <MDXRemote source={content} />
            </div>
          ) : (
            <p className="text-secondary">
              No current focus information available yet.
            </p>
          )}
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="text-sm text-secondary mt-12 pt-8 border-t border-muted">
            This page is inspired by the{' '}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent"
            >
              now page movement
            </a>
            .
          </p>
        </FadeIn>
      </Container>
    </div>
  );
}
