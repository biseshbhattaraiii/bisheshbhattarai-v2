import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, JsonLd } from '@/ui/common';
import { siteConfig, socialLinks, substackUrl } from '@/lib/config';
import { buildMetadata, graph, breadcrumbSchema } from '@/lib/seo';
import { hero } from '@/lib/narrative';

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: '/',
});

/**
 * One screen: the line, the notebook, a way to reach me.
 *
 * Nothing else is surfaced here by design. Entries stay at their own URLs,
 * reachable by anyone holding the link.
 */
export default function HomePage() {
  const socials = socialLinks();

  return (
    <>
      <section>
        <Container className="py-step-4">
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            {hero.headline}
          </h1>

          <p className="mt-6 text-lg text-secondary md:text-xl">
            Read my notebook at{' '}
            <a href={substackUrl} rel="noreferrer" className="link">
              bishes.substack.com
            </a>
          </p>

          <div className="mt-8">
            <a
              href={substackUrl}
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              Subscribe on Substack
            </a>
          </div>

          <p className="mt-step text-base text-secondary">
            Treks, trips, hobbies and the lessons in between are stamped in{' '}
            <Link href="/passport" className="link">
              my passport
            </Link>
            .
          </p>

          {socials.length > 0 && (
            <ul className="mt-step flex flex-wrap gap-x-5 text-sm text-secondary">
              {socials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="me noreferrer"
                    className="inline-block py-1.5 hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-step text-sm text-secondary">
            <a href={`mailto:${siteConfig.author.email}`} className="link">
              {siteConfig.author.email}
            </a>
          </p>
        </Container>
      </section>

      <JsonLd data={graph(breadcrumbSchema([{ name: 'Home', path: '/' }]))} />
    </>
  );
}
