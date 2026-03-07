import { Container } from '@/ui/common';
import { siteConfig } from '@/lib/config';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 mt-16 bg-muted/30">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-secondary font-medium">
            © {currentYear} {siteConfig.author.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {siteConfig.author.github && (
              <a
                href={`https://github.com/${siteConfig.author.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                GitHub
              </a>
            )}
            {siteConfig.author.twitter && (
              <a
                href={`https://twitter.com/${siteConfig.author.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                Twitter
              </a>
            )}
            {siteConfig.author.linkedin && (
              <a
                href={`https://linkedin.com/in/${siteConfig.author.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
