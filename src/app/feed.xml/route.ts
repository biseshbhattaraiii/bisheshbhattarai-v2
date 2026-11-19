import { contentRepository } from '@/adapters/content';
import { postPath } from '@/domain/types';
import { siteConfig, absoluteUrl } from '@/lib/config';
import { categoryLabel } from '@/lib/categories';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RSS 2.0 for the journal. */
export async function GET() {
  const posts = await contentRepository.getAllPosts();
  const updated = posts[0]
    ? new Date(posts[0].updated ?? posts[0].date)
    : new Date();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(postPath(post));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${escapeXml(categoryLabel(post.category))}</category>
${post.tags
  .map((tag) => `      <category>${escapeXml(tag)}</category>`)
  .join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} · Journal</title>
    <link>${absoluteUrl('/journal')}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <managingEditor>${siteConfig.author.email} (${escapeXml(
      siteConfig.author.name
    )})</managingEditor>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl(
      '/feed.xml'
    )}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
