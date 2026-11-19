import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';

// Body / UI typeface — quiet, legible, modern.
export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Editorial serif — headlines, entry titles, pull quotes.
export const fontDisplay = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-display',
});

// Labels, dates, code.
export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
