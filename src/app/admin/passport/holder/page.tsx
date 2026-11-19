import { loadForAdmin } from '@/lib/passport/admin-ops';
import { BackLink } from '@/ui/common';
import { HolderForm } from '@/ui/admin/passport';

export const dynamic = 'force-dynamic';

export default async function HolderPage() {
  const { holder } = await loadForAdmin();

  return (
    <div className="py-step-2">
      <div className="mb-step border-b border-border pb-4">
        <BackLink href="/admin/passport" label="the passport" />
        <p className="label mt-4">Back office / Passport / Holder</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Holder details</h1>
      </div>
      <HolderForm initial={holder} />
    </div>
  );
}
