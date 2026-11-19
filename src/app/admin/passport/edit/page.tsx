import { notFound } from 'next/navigation';
import type { EntryKind } from '@/domain/types/passport';
import { loadForAdmin } from '@/lib/passport/admin-ops';
import { kindMeta, kinds } from '@/lib/passport/kinds';
import { BackLink } from '@/ui/common';
import { EntryForm, blankDraft, toDraft } from '@/ui/admin/passport';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  searchParams: Promise<{ slug?: string; kind?: string; status?: string }>;
}

function asKind(value?: string): EntryKind {
  return kinds.some((k) => k.kind === value) ? (value as EntryKind) : 'trek';
}

export default async function EditPassportEntryPage({ searchParams }: EditPageProps) {
  const { slug, kind, status } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

  let initial;
  if (slug) {
    const entry = (await loadForAdmin()).entries.find((e) => e.slug === slug);
    if (!entry) notFound();
    initial = toDraft(entry);
  } else {
    initial = blankDraft(asKind(kind), status === 'dream' ? 'dream' : 'done', today);
  }

  return (
    <div className="py-step-2">
      <div className="mb-step border-b border-border pb-4">
        <BackLink href="/admin/passport" label="the passport" />
        <p className="label mt-4">Back office / Passport / {slug ? 'Edit' : 'New'}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          {slug ? initial.title : `New ${kindMeta(initial.kind).label.toLowerCase()}`}
        </h1>
      </div>
      <EntryForm key={slug ?? 'new'} initial={initial} originalSlug={slug ?? null} />
    </div>
  );
}
