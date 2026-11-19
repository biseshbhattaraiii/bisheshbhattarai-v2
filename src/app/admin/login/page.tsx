import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/ui/admin';
import { BackLink } from '@/ui/common';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm py-step-4">
      <BackLink href="/" label="the site" />
      <p className="label mt-6">Back office</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        Sign in
      </h1>
      <p className="mt-2 text-secondary">This part of the site is private.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
