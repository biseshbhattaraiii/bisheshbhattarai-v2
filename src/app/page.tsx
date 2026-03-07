import Link from 'next/link';
import { format } from 'date-fns';
import { Container, Card, Tag } from '@/ui/common';
import { HeroScene, FadeIn, PageDecor } from '@/ui/animations';
import { contentRepository } from '@/adapters/content';
import { siteConfig } from '@/lib/config';

export default async function HomePage() {
  const allPosts = await contentRepository.getAllPosts();
  const latestPosts = allPosts.slice(0, 3);
  const featuredProjects = await contentRepository.getFeaturedProjects();
  const featuredProject = featuredProjects[0];

  return (
    <>
      <PageDecor variant="runner" />
      <PageDecor variant="car" />
      <div className="py-12">
        <Container>
          <HeroScene />

          <FadeIn delay={0.3}>
            <div className="mt-12 text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
                {siteConfig.author.name}
              </h1>
              <p className="text-xl text-secondary leading-relaxed">
                {siteConfig.author.bio}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <section className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold font-display">
                  Latest from the Journal
                </h2>
                <Link
                  href="/journal"
                  className="text-primary hover:text-accent transition-colors font-medium"
                >
                  View all →
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {latestPosts.map((post) => (
                  <Card key={post.slug} href={`/journal/${post.slug}`}>
                    <div className="mb-3">
                      <Tag>{post.category}</Tag>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-secondary mb-4">{post.description}</p>
                    <div className="flex items-center justify-between text-sm text-secondary">
                      <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
                      {post.readingTime && <span>{post.readingTime} min read</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </FadeIn>

          {featuredProject && (
            <FadeIn delay={0.7}>
              <section className="mt-20">
                <h2 className="text-3xl font-bold font-display mb-8">
                  Featured Project
                </h2>
                <Card href={`/projects/${featuredProject.slug}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-3">
                        {featuredProject.title}
                      </h3>
                      <p className="text-secondary mb-4">
                        {featuredProject.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {featuredProject.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            </FadeIn>
          )}
        </Container>
      </div>
    </>
  );
}
