'use client';

import { useEffect, useState } from 'react';

interface Settings {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
}

/**
 * Tailwind class names are written out in full here so the compiler can
 * see them — they are applied to the entry at runtime, never generated.
 */
const FONT_FAMILIES = [
  { label: 'Serif', value: 'font-display' },
  { label: 'Sans', value: 'font-sans' },
  { label: 'Mono', value: 'font-mono' },
];

const FONT_SIZES = [
  { label: 'S', value: 'text-base' },
  { label: 'M', value: 'text-lg' },
  { label: 'L', value: 'text-xl' },
];

const LINE_HEIGHTS = [
  { label: 'Tight', value: 'leading-relaxed' },
  { label: 'Ruled', value: 'leading-loose' },
  { label: 'Wide', value: 'leading-[2.2]' },
];

const ALL_CLASSES = [...FONT_FAMILIES, ...FONT_SIZES, ...LINE_HEIGHTS].map(
  (o) => o.value
);

const DEFAULTS: Settings = {
  fontFamily: 'font-sans',
  fontSize: 'text-lg',
  lineHeight: 'leading-loose',
};

const STORAGE_KEY = 'notebook-reading-settings';

/**
 * Pen-and-paper controls for a single entry.
 *
 * Deliberately static: it opens and closes, nothing slides or fades.
 */
export function ReadingSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setSettings({ ...DEFAULTS, ...(JSON.parse(saved) as Settings) });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const entry = document.querySelector('[data-reading-content]');
    if (entry) {
      entry.classList.remove(...ALL_CLASSES);
      entry.classList.add(
        settings.fontFamily,
        settings.fontSize,
        settings.lineHeight
      );
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Close on Escape, the way every other panel on the web behaves.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 text-right">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Reading settings"
          className="mb-2 w-56 rounded-lg border border-border bg-surface p-4 text-left shadow-card"
        >
          <Row
            label="Typeface"
            options={FONT_FAMILIES}
            value={settings.fontFamily}
            onChange={(v) => setSettings({ ...settings, fontFamily: v })}
          />
          <Row
            label="Size"
            options={FONT_SIZES}
            value={settings.fontSize}
            onChange={(v) => setSettings({ ...settings, fontSize: v })}
          />
          <Row
            label="Leading"
            options={LINE_HEIGHTS}
            value={settings.lineHeight}
            onChange={(v) => setSettings({ ...settings, lineHeight: v })}
          />
          <button
            type="button"
            onClick={() => setSettings(DEFAULTS)}
            className="mt-3 w-full rounded-md border border-border px-2 py-1.5 text-xs text-secondary hover:border-accent/40 hover:text-accent"
          >
            Reset
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-secondary shadow-card hover:border-accent/40 hover:text-accent"
      >
        {isOpen ? 'Close' : 'Aa'}
      </button>
    </div>
  );
}

interface RowProps {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

function Row({ label, options, value, onChange }: RowProps) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="label mb-1">
        {label}
      </p>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`flex-1 border px-2 py-1 text-xs ${
              value === option.value
                ? 'border-accent text-accent'
                : 'border-border text-secondary hover:border-accent/50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
