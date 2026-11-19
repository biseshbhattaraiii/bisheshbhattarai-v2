import Link from 'next/link';
import { isBlobConfigured, passportStore } from '@/adapters/passport';
import type { PassportEntry } from '@/domain/types/passport';
import { loadForAdmin } from '@/lib/passport/admin-ops';
import { kindMeta, kinds } from '@/lib/passport/kinds';
import { byDateDesc } from '@/lib/passport/stats';
import { BackLink } from '@/ui/common';
import { Stamp } from '@/ui/passport';

export const dynamic = 'force-dynamic';

function Row({ entry }: { entry: PassportEntry }) {
  const meta = kindMeta(entry.kind);
  return (
    <li className="flex items-center gap-4 border-b border-border py-3">
      <div className="pp w-16 shrink-0" style={{ background: 'transparent' }}>
        <Stamp entry={entry} idSuffix="-row" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/passport/edit?slug=${encodeURIComponent(entry.slug)}`} className="font-display text-lg font-semibold hover:text-accent">
          {entry.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-secondary">
          <span>{meta.label}</span>
          <span>{entry.status === 'dream' ? entry.target || 'Wish list' : entry.startDate || 'no date'}</span>
          {!entry.published && <span className="text-accent">private</span>}
        </div>
      </div>
      {entry.published && (
        <Link href={`/passport/${entry.slug}`} className="text-xs text-secondary hover:text-accent">
          View →
        </Link>
      )}
    </li>
  );
}

export default async function AdminPassportPage() {
  let entries: PassportEntry[] = [];
  let loadError = '';
  try {
    entries = (await loadForAdmin()).entries.sort(byDateDesc);
  } catch (error) {
    loadError = (error as Error).message;
  }
  const production = process.env.NODE_ENV === 'production';

  return (
    <div className="py-step-2">
      <div className="border-b border-border pb-step">
        <BackLink href="/admin" label="the desk" />
        <p className="label mt-4">Back office / Passport</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Passport</h1>
        <p className="mt-2 text-sm text-secondary">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · stored in {passportStore().label}
        </p>
      </div>

      {production && !isBlobConfigured() && (
        <p className="mt-step rounded-md border border-dashed border-accent/50 p-4 text-sm text-secondary">
          Storage is not connected, so saving will fail on this server. Create a Blob store in your Vercel project
          (Storage → Blob) and redeploy: it adds <code>BLOB_READ_WRITE_TOKEN</code> for you.
        </p>
      )}
      {loadError && <p className="mt-step text-sm text-red-600 dark:text-red-400">Could not load the passport: {loadError}</p>}

      <div className="mt-step flex flex-wrap gap-2">
        {kinds.map((k) => (
          <Link key={k.kind} href={`/admin/passport/edit?kind=${k.kind}`} className="rounded-md border border-accent bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
            + {k.label}
          </Link>
        ))}
        <Link href="/admin/passport/edit?kind=trek&status=dream" className="rounded-md border border-border px-4 py-2 text-sm text-secondary hover:text-accent">
          + Wish list
        </Link>
        <Link href="/admin/passport/holder" className="rounded-md border border-border px-4 py-2 text-sm text-secondary hover:text-accent">
          Holder details
        </Link>
        <Link href="/passport" className="rounded-md border border-border px-4 py-2 text-sm text-secondary hover:text-accent">
          View passport
        </Link>
      </div>

      <section className="mt-step-2">
        <h2 className="label mb-3">Entries</h2>
        {entries.length === 0 ? (
          <p className="text-secondary">No stamps yet. Pick a kind above to add your first.</p>
        ) : (
          <ul className="border-t border-border">
            {entries.map((e) => (
              <Row key={e.slug} entry={e} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
