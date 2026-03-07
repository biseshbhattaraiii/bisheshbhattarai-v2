import { contentRepository } from '@/adapters/content';
import { Container, Card, Tag } from '@/ui/common';
import { FadeIn } from '@/ui/animations';

export default async function ProjectsPage() {
  const projects = await contentRepository.getAllProjects();

  return (
    <div className="py-12">
      <Container>
        <FadeIn>
          <h1 className="text-5xl font-bold font-display mb-6">Projects</h1>
          <p className="text-xl text-secondary mb-12">
            Things I've built and experiments in progress
          </p>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project, index) => (
            <FadeIn key={project.slug} delay={0.1 * index}>
              <Card>
                <h2 className="text-2xl font-semibold mb-3">
                  {project.title}
                </h2>
                <p className="text-secondary mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>

                <div className="flex gap-4">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent transition-colors"
                    >
                      View Live →
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent transition-colors"
                    >
                      GitHub →
                    </a>
                  )}
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-center text-secondary py-12">
            No projects to display yet. Check back soon!
          </p>
        )}
      </Container>
    </div>
  );
}
