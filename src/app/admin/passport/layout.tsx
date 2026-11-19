import type { ReactNode } from 'react';
import { passportFontVars } from '@/lib/passport/fonts';
import { InkFilters } from '@/ui/passport';
import '@/ui/passport/styles/tokens.css';
import '@/ui/passport/styles/passport.css';

/** Back-office screens for the passport: site styling, passport stamps. */
export default function AdminPassportLayout({ children }: { children: ReactNode }) {
  return (
    <div className={passportFontVars}>
      <InkFilters />
      {children}
    </div>
  );
}
