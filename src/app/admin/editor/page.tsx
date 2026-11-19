import Link from 'next/link';
import { EntryEditor } from '@/ui/admin';
import { BackLink } from '@/ui/common';

export const dynamic = 'force-dynamic';

interface EditorPageProps {
  searchParams: Promise<{ slug?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { slug } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="py-step-2">
      <div className="mb-step flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <BackLink href="/admin" label="the desk" />
          <p className="label mt-4">
            <Link href="/admin" className="hover:text-accent">
              Back office
            </Link>{' '}
            / {slug ? 'Edit' : 'New entry'}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            {slug ?? 'New entry'}
          </h1>
        </div>
      </div>

      <EntryEditor initialSlug={slug} today={today} />
    </div>
  );
}
