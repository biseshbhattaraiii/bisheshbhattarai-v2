import type { Config } from 'tailwindcss';

/** Vertical rhythm unit. Section spacing is a multiple of this. */
const STEP = '1.75rem'; // 28px

const config: Config = {
  // Theme is an explicit choice, stored and toggled — not only a media query.
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        highlight: 'rgb(var(--highlight) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
        serif: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      spacing: {
        step: STEP,
        'step-2': `calc(${STEP} * 2)`,
        'step-3': `calc(${STEP} * 3)`,
        'step-4': `calc(${STEP} * 4)`,
        'step-6': `calc(${STEP} * 6)`,
      },
      maxWidth: {
        // Reading measure: roughly 70 characters.
        prose: '44rem',
        content: '58rem',
        page: '78rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.05), 0 8px 24px -18px rgb(var(--shadow) / 0.25)',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--foreground))',
            '--tw-prose-headings': 'rgb(var(--foreground))',
            '--tw-prose-links': 'rgb(var(--accent))',
            '--tw-prose-bold': 'rgb(var(--foreground))',
            '--tw-prose-quotes': 'rgb(var(--foreground))',
            '--tw-prose-quote-borders': 'rgb(var(--accent))',
            '--tw-prose-code': 'rgb(var(--foreground))',
            '--tw-prose-hr': 'rgb(var(--border))',
            '--tw-prose-counters': 'rgb(var(--secondary))',
            '--tw-prose-bullets': 'rgb(var(--accent))',
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
