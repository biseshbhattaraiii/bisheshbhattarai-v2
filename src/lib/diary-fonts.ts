import { Bricolage_Grotesque, Instrument_Serif, Cutive_Mono } from 'next/font/google';

// Body and headings: a grotesque with an optical-size axis.
export const fontDiaryBody = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
  variable: '--d-body',
});

// Quotes and section titles.
export const fontDiarySerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--d-serif',
});

// The markdown marks, dates and labels: a typewriter.
export const fontDiaryMono = Cutive_Mono({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--d-mono',
});

export const diaryFontVars = `${fontDiaryBody.variable} ${fontDiarySerif.variable} ${fontDiaryMono.variable}`;
