import type { ReactNode } from 'react';
import { siteConfig } from '@/lib/config';
import { passportFontVars } from '@/lib/passport/fonts';
import { getPublicPassport } from '@/lib/passport/get-passport';
import { Guilloche, InkFilters, PassportHeader } from '@/ui/passport';
import '@/ui/passport/styles/tokens.css';
import '@/ui/passport/styles/passport.css';
import '@/ui/passport/styles/entry.css';

/** The passport's own world: security paper, a foil cover band, ink. */
export default async function PassportLayout({ children }: { children: ReactNode }) {
  const { holder } = await getPublicPassport();

  return (
    <div className={`pp ${passportFontVars} relative min-h-screen`}>
      <Guilloche />
      <InkFilters />
      <PassportHeader ownerName={holder.name || siteConfig.name} />
      <div className="relative z-[1] mx-auto w-full max-w-page px-5 pb-20 pt-8 sm:px-8 lg:px-12">
        {children}
      </div>
    </div>
  );
}
