import Link from 'next/link';
import { Container } from '@/ui/common';
import { NewsletterForm } from '@/ui/newsletter';
import { siteConfig } from '@/lib/config';
import { categories } from '@/lib/categories';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const social = [
    { label: 'Email', href: `mailto:${siteConfig.author.email}` },
    siteConfig.author.github && {
      label: 'GitHub',
      href: `https://github.com/${siteConfig.author.github}`,
    },
    siteConfig.author.linkedin && {
      label: 'LinkedIn',
      href: `https://linkedin.com/in/${siteConfig.author.linkedin}`,
    },
    siteConfig.author.twitter && {
      label: 'X',
      href: `https://x.com/${siteConfig.author.twitter}`,
    },
    { label: 'RSS', href: '/feed.xml' },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-step-4 border-t border-border bg-muted/40">
      <Container className="py-step-2">
        <div className="mb-step-2 border-b border-border pb-step">
          <NewsletterForm compact />
        </div>

        <div className="grid gap-step md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </p>
            <p className="mt-2 max-w-xs text-sm text-secondary">
              {siteConfig.author.bio}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="label mb-3">Site</p>
            <ul className="text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block py-1.5 text-secondary hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Writing topics">
            <p className="label mb-3">Writing</p>
            <ul className="flex flex-wrap gap-x-4 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/journal/${category.slug}`}
                    className="inline-block py-1.5 text-secondary hover:text-accent"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-step-2 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-secondary">
          <p>
            © {currentYear} {siteConfig.author.name}
          </p>
          <ul className="flex flex-wrap gap-x-5">
            {social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  rel="me noreferrer"
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  className="inline-block py-1.5 hover:text-accent"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
