'use client';

import type { Suggestion } from '@/lib/ai/proofread';

interface SuggestionListProps {
  suggestions: Suggestion[];
  onApply: (suggestion: Suggestion) => void;
  onDismiss: (id: string) => void;
  /** Whether a check has run at least once. */
  checked: boolean;
  checking: boolean;
}

/** Margin notes from the assist — each one accepted or ignored by hand. */
export function SuggestionList({
  suggestions,
  onApply,
  onDismiss,
  checked,
  checking,
}: SuggestionListProps) {
  if (checking && suggestions.length === 0) {
    return (
      <p className="mt-4 text-sm text-secondary">Reading…</p>
    );
  }

  if (suggestions.length === 0) {
    return (
      <p className="mt-4 text-sm text-secondary">
        {checked ? 'Nothing to flag.' : 'No check run yet.'}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {suggestions.map((suggestion) => (
        <li
          key={suggestion.id}
          className="border-t border-dashed border-border pt-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-accent">
              {suggestion.type}
            </span>
            {suggestion.ambiguous && (
              <span
                className="text-[0.7rem] text-secondary"
                title="This phrase appears more than once; the first match is used."
              >
                repeated
              </span>
            )}
          </div>

          <p className="mt-1 text-[0.8rem] leading-snug">
            <span className="text-secondary line-through decoration-accent/60">
              {suggestion.original}
            </span>{' '}
            <span className="highlighted">{suggestion.suggestion}</span>
          </p>

          {suggestion.note && (
            <p className="mt-1 text-[0.75rem] leading-snug text-secondary">
              {suggestion.note}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onApply(suggestion)}
              className="rounded-md border border-accent/50 px-2.5 py-1 text-xs text-accent hover:bg-accent/10"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => onDismiss(suggestion.id)}
              className="rounded-md border border-border px-2.5 py-1 text-xs text-secondary hover:text-foreground"
            >
              Ignore
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
