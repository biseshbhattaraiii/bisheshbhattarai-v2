import type { ReactNode } from 'react';

/** Labelled control, matching the journal editor's fields. */
export function Field({ label, hint, children, className = '' }: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid min-w-0 gap-1.5 ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="text-xs text-secondary">{hint}</span>}
    </label>
  );
}

export function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="card grid min-w-0 gap-4 p-5">
      <legend className="px-1 font-display text-lg font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}

/** Pick-one buttons. */
export function Choice<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              value === o.value
                ? 'border-accent bg-accent text-white'
                : 'border-border text-secondary hover:border-accent/40 hover:text-accent'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const smallButton =
  'rounded-md border border-border px-3 py-1.5 text-xs text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-50';

export const dangerButton =
  'rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-400';
