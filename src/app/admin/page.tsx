import Link from 'next/link';
import { listAllEntries } from '@/lib/admin/entries';
import { isDeepSeekConfigured } from '@/lib/ai/deepseek';
import { activeProvider } from '@/lib/newsletter';
import { categoryLabel } from '@/lib/categories';
import { SignOutButton } from '@/ui/admin';
import { BackLink } from '@/ui/common';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const entries = await listAllEntries();
  const drafts = entries.filter((e) => !e.published);
  const assistReady = isDeepSeekConfigured();
  const newsletter = activeProvider();

  return (
    <div className="py-step-2">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-step">
        <div>
          <BackLink href="/" label="the site" />
          <p className="label mt-4">Back office</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            The desk
          </h1>
          <p className="mt-2 text-sm text-secondary">
            {entries.length} entries · {drafts.length} drafts ·{' '}
            {assistReady ? 'AI assist ready' : 'AI assist not configured'} ·
            newsletter: {newsletter}
          </p>
        </div>
        <SignOutButton />
      </div>

      {!assistReady && (
        <p className="mt-step rounded-md border border-dashed border-accent/50 p-4 text-sm text-secondary">
          Set <code>DEEPSEEK_API_KEY</code> in <code>.env.local</code> to turn
          on the writing assist. Everything else works without it.
        </p>
      )}

      <div className="mt-step flex flex-wrap gap-3">
        <Link
          href="/admin/editor"
          className="rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          New entry
        </Link>
        <Link
          href="/admin/passport"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-secondary hover:border-accent/40 hover:text-accent"
        >
          Passport
        </Link>
        <Link
          href="/journal"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-secondary hover:border-accent/40 hover:text-accent"
        >
          View journal
        </Link>
      </div>

      <section className="mt-step-2">
        <h2 className="label mb-3">Entries</h2>

        {entries.length === 0 ? (
          <p className="text-secondary">
            Nothing here yet. Start a new entry.
          </p>
        ) : (
          <ul className="border-t border-border">
            {entries.map((entry) => (
              <li
                key={entry.slug}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-4"
              >
                <div>
                  <Link
                    href={`/admin/editor?slug=${encodeURIComponent(entry.slug)}`}
                    className="font-display text-lg font-semibold hover:text-accent"
                  >
                    {entry.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-secondary">
                    <span>{entry.date || 'no date'}</span>
                    <span>{categoryLabel(entry.category)}</span>
                    {!entry.published && (
                      <span className="text-accent">draft</span>
                    )}
                  </div>
                </div>

                {entry.published && entry.category && (
                  <Link
                    href={`/journal/${entry.category}/${entry.slug}`}
                    className="text-xs text-secondary hover:text-accent"
                  >
                    View →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
