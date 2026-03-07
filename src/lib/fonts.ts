import { Inter } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const fontDisplay = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '800'],
  variable: '--font-display',
});
