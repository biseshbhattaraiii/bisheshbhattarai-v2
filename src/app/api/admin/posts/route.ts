import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { categorySlugs } from '@/lib/categories';
import { POSTS_DIR, listAllEntries } from '@/lib/admin/entries';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const draftSchema = z.object({
  slug: z.string().regex(SLUG_PATTERN, 'Slug must be lowercase words joined by hyphens.'),
  title: z.string().min(1, 'A title is required.'),
  description: z.string().min(1, 'A description is required.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.'),
  category: z.enum(categorySlugs as [string, ...string[]]),
  tags: z.array(z.string()).max(12).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  body: z.string().default(''),
  /** Refuse to clobber an existing file unless the editor says so. */
  overwrite: z.boolean().default(false),
});

/** Resolves a slug to a path inside the posts directory, or null. */
function resolvePostPath(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) return null;
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  // Belt and braces: the regex already forbids separators.
  if (!filePath.startsWith(`${POSTS_DIR}${path.sep}`)) return null;
  return filePath;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** List drafts and published entries, or load one for editing. */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug');

  if (slug) {
    const filePath = resolvePostPath(slug);
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid slug.' }, { status: 400 });
    }

    try {
      const file = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(file);
      return NextResponse.json({ slug, frontmatter: data, body: content });
    } catch {
      return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
    }
  }

  const posts = await listAllEntries();
  return NextResponse.json(
    { posts },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

/** Create or update an entry on disk. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const parsed = draftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid draft.' },
      { status: 400 }
    );
  }

  const draft = parsed.data;
  const filePath = resolvePostPath(draft.slug);
  if (!filePath) {
    return NextResponse.json({ error: 'Invalid slug.' }, { status: 400 });
  }

  const alreadyExists = await exists(filePath);
  if (alreadyExists && !draft.overwrite) {
    return NextResponse.json(
      { error: 'An entry with that slug already exists.', code: 'exists' },
      { status: 409 }
    );
  }

  const file = matter.stringify(`${draft.body.trim()}\n`, {
    title: draft.title,
    description: draft.description,
    date: draft.date,
    ...(alreadyExists
      ? { updated: new Date().toISOString().slice(0, 10) }
      : {}),
    category: draft.category,
    tags: draft.tags,
    published: draft.published,
    ...(draft.featured ? { featured: true } : {}),
  });

  try {
    await fs.mkdir(POSTS_DIR, { recursive: true });
    await fs.writeFile(filePath, file, 'utf-8');
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
      return NextResponse.json(
        {
          error:
            'This deployment has a read-only filesystem. Download the .mdx and commit it instead.',
          code: 'readonly',
        },
        { status: 501 }
      );
    }
    console.error('failed to write post', error);
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug: draft.slug,
    updated: alreadyExists,
  });
}
