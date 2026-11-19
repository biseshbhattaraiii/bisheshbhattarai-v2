import type { Metadata } from 'next';
import type { Post } from '@/domain/types';
import { postPath } from '@/domain/types';
import { siteConfig, absoluteUrl, socialLinks } from './config';
import { categoryLabel } from './categories';

interface PageMetaInput {
  title: string;
  description: string;
  /** Site-root-relative path, e.g. "/journal". Becomes the canonical URL. */
  path: string;
  /** Path to an OG image; defaults to the route's generated one. */
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noIndex?: boolean;
}

/**
 * One place where canonicals, OpenGraph and Twitter cards are assembled,
 * so no route can quietly ship without them.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  noIndex = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  // Only set `images` when there is an explicit one. Passing `undefined`
  // suppresses the opengraph-image.tsx file convention, which is what
  // generates the card for every route that doesn't ship its own picture.
  const images = image ? { images: [{ url: absoluteUrl(image) }] } : {};

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...images,
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime,
            authors: [absoluteUrl('/')],
            tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...images,
      creator: siteConfig.author.twitter
        ? `@${siteConfig.author.twitter}`
        : undefined,
    },
  };
}

/* ── JSON-LD ─────────────────────────────────────────────────────── */

const personId = absoluteUrl('/#person');
const siteId = absoluteUrl('/#website');

export function personSchema() {
  const sameAs = socialLinks().map((link) => link.href);

  return {
    '@type': 'Person',
    '@id': personId,
    name: siteConfig.author.name,
    url: absoluteUrl('/'),
    email: `mailto:${siteConfig.author.email}`,
    jobTitle: siteConfig.author.jobTitle,
    description: siteConfig.author.bio,
    knowsAbout: siteConfig.keywords,
    sameAs,
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': siteId,
    url: absoluteUrl('/'),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: siteConfig.locale.replace('_', '-'),
    publisher: { '@id': personId },
  };
}

export function blogPostingSchema(post: Post) {
  const url = absoluteUrl(postPath(post));

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.updated ?? post.date).toISOString(),
    author: { '@id': personId },
    publisher: { '@id': personId },
    isPartOf: { '@id': siteId },
    articleSection: categoryLabel(post.category),
    keywords: post.tags.join(', '),
    wordCount: post.wordCount,
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
    image: post.coverImage
      ? absoluteUrl(post.coverImage)
      : absoluteUrl(`${postPath(post)}/opengraph-image`),
    inLanguage: siteConfig.locale.replace('_', '-'),
  };
}

/** Marks the journal itself as a Blog, with its author and publisher. */
export function blogSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@type': 'Blog',
    '@id': `${absoluteUrl(path)}#blog`,
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: siteConfig.locale.replace('_', '-'),
    author: { '@id': personId },
    publisher: { '@id': personId },
    isPartOf: { '@id': siteId },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionSchema({
  name,
  description,
  path,
  posts,
}: {
  name: string;
  description: string;
  path: string;
  posts: Post[];
}) {
  return {
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(path)}#collection`,
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { '@id': siteId },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(postPath(post)),
        name: post.title,
      })),
    },
  };
}

/** Wraps a set of schema nodes into a single @graph document. */
export function graph(...nodes: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
